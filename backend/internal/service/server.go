package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	clerksdk "github.com/clerk/clerk-sdk-go/v2"
	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/repository"

	"github.com/generate/selfserve/internal/service/clerk"
	"github.com/generate/selfserve/internal/storage/redis"

	s3storage "github.com/generate/selfserve/internal/service/s3"
	opensearchstorage "github.com/generate/selfserve/internal/service/storage/opensearch"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/generate/selfserve/internal/validation"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/favicon"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	goredis "github.com/redis/go-redis/v9"
)

type App struct {
	Server      *fiber.App
	Repo        *storage.Repository
	S3Storage   *s3storage.Storage
	RedisClient *goredis.Client
}

func InitApp(cfg *config.Config) (*App, error) {
	validation.Init()

	// Init DB/repository(ies)

	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		return nil, err
	}

	redisClient := tryInitRedis()

	s3Store, err := s3storage.NewS3Storage(cfg.S3)
	if err != nil {
		if e := repo.Close(); e != nil {
			return nil, errors.Join(err, e)
		}
		return nil, err
	}

	openSearchRepos := tryInitOpenSearchRepositories(cfg)

	genkitInstance := aiflows.InitGenkit(context.Background(), &cfg.LLM)
	app := setupApp()
	setupClerk(cfg)

	if err = setupRoutes(app, repo, genkitInstance, cfg, s3Store, openSearchRepos); err != nil { //nolint:wsl
		if e := repo.Close(); e != nil {
			return nil, errors.Join(err, e)
		}
		return nil, err
	}

	return &App{
		Server:      app,
		Repo:        repo,
		RedisClient: redisClient,
		S3Storage:   s3Store,
	}, nil
}

type openSearchRepositories struct {
	Guests storage.GuestsSearchRepository
}

func tryInitOpenSearchRepositories(cfg *config.Config) openSearchRepositories {
	client, err := opensearchstorage.NewClient(cfg.OpenSearch)
	if err != nil {
		log.Printf("Warning: OpenSearch not available: %v", err)
		return openSearchRepositories{}
	}
	if err := opensearchstorage.EnsureGuestsIndex(context.Background(), client); err != nil {
		log.Printf("Warning: failed to ensure OpenSearch guests index: %v", err)
		return openSearchRepositories{}
	}
	return openSearchRepositories{
		Guests: repository.NewOpenSearchGuestsRepository(client),
	}
}

func tryInitRedis() *goredis.Client {
	redisClient, err := redis.InitRedis()
	if err != nil {
		log.Printf("Warning: Redis not available: %v", err)
		return nil
	}
	return redisClient
}

func setupRoutes(app *fiber.App, repo *storage.Repository, genkitInstance *aiflows.GenkitService,
	cfg *config.Config, s3Store *s3storage.Storage, openSearchRepos openSearchRepositories) error {
	// Swagger documentation
	app.Get("/swagger/*", handler.ServeSwagger)

	// @Summary      Health check
	// @Description  Check if the API is running
	// @Tags         health
	// @Produce      plain
	// @Success      200
	// @Router       /health [get]
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	// initialize users repo
	usersRepo := repository.NewUsersRepository(repo.DB)

	// initialize handler(s)
	helloHandler := handler.NewHelloHandler()
	devsHandler := handler.NewDevsHandler(repository.NewDevsRepository(repo.DB))
	usersHandler := handler.NewUsersHandler(repository.NewUsersRepository(repo.DB))
	guestsHandler := handler.NewGuestsHandler(repository.NewGuestsRepository(repo.DB), openSearchRepos.Guests)
	reqsHandler := handler.NewRequestsHandler(repository.NewRequestsRepo(repo.DB), genkitInstance)
	hotelsHandler := handler.NewHotelsHandler(repository.NewHotelsRepository(repo.DB))
	s3Handler := handler.NewS3Handler(s3Store)
	roomsHandler := handler.NewRoomsHandler(repository.NewRoomsRepository(repo.DB))

	clerkWhSignatureVerifier, err := handler.NewWebhookVerifier(cfg)
	if err != nil {
		return err
	}
	clerkWebhookHandler := handler.NewClerkWebHookHandler(usersRepo, clerkWhSignatureVerifier)

	// API v1 routes
	api := app.Group("/api/v1")

	// clerk webhook route
	api.Route("/clerk", func(r fiber.Router) {
		r.Post("/user", clerkWebhookHandler.CreateUser)
	})

	verifier := clerk.NewClerkJWTVerifier()
	app.Use(clerk.NewAuthMiddleware(verifier))

	// Hello routes
	api.Route("/hello", func(r fiber.Router) {
		r.Get("/", helloHandler.GetHello)
		r.Get("/:name", helloHandler.GetHelloName)
	})

	// Dev routes
	api.Route("/devs", func(r fiber.Router) {
		r.Get("/:name", devsHandler.GetMember)
	})

	// users routes
	api.Route("/users", func(r fiber.Router) {
		r.Get("/:id", usersHandler.GetUserByID)
		r.Post("/", usersHandler.CreateUser)
		r.Put("/:id", usersHandler.UpdateUser)
	})

	// Guest Routes
	api.Route("/guests", func(r fiber.Router) {
		r.Post("/", guestsHandler.CreateGuest)
		r.Get("/:id", guestsHandler.GetGuest)
		r.Put("/:id", guestsHandler.UpdateGuest)
		r.Post("/search", guestsHandler.GetGuests)
		r.Get("/stays/:id", guestsHandler.GetGuestWithStays)
	})

	// Request routes
	api.Route("/request", func(r fiber.Router) {
		r.Post("/", reqsHandler.CreateRequest)
		r.Post("/generate", reqsHandler.GenerateRequest)
		r.Put("/:id", reqsHandler.UpdateRequest)
		r.Get("/:id", reqsHandler.GetRequest)
		r.Get("/cursor/:cursor", reqsHandler.GetRequestByCursor)
	})

	// Hotel routes
	api.Route("/hotels", func(r fiber.Router) {
		r.Get("/:id", hotelsHandler.GetHotelByID)
		r.Post("/", hotelsHandler.CreateHotel)
	})

	// rooms routes
	api.Route("/rooms", func(r fiber.Router) {
		r.Post("/", roomsHandler.FilterRooms)
		r.Get("/floors", roomsHandler.GetFloors)
	})

	// s3 routes
	api.Route("/s3", func(r fiber.Router) {
		r.Get("/presigned-url/:key", s3Handler.GeneratePresignedURL)
	})

	return nil
}

// Initialize Fiber app with middlewares / configs
func setupApp() *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder:    json.Marshal,
		JSONDecoder:    json.Unmarshal,
		ErrorHandler:   errs.ErrorHandler,
		ReadBufferSize: 16 * 1024, // 16KB to accommodate Clerk JWTs
	})
	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${ip}:${port} ${pid} ${locals:requestid} ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(favicon.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	allowedOrigins := os.Getenv("APP_CORS_ORIGINS")
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     "GET,POST,PUT,DELETE",
		AllowHeaders:     "Origin, Content-Type, Authorization, X-Hotel-ID",
		AllowCredentials: true,
	}))

	return app
}

func setupClerk(cfg *config.Config) {
	if os.Getenv("ENV") == "development" {
		clerksdk.SetKey(cfg.Clerk.SecretKey)
	} else {
		/*
			Missing prod url to complete
		*/
		fmt.Print("No clerk for prod yet.")
	}
}
