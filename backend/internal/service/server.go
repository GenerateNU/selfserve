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
	temporalservice "github.com/generate/selfserve/internal/temporal"

	"github.com/generate/selfserve/internal/service/clerk"
	notificationssvc "github.com/generate/selfserve/internal/service/notifications"
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
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

type App struct {
	Server         *fiber.App
	Repo           *storage.Repository
	S3Storage      *s3storage.Storage
	RedisClient    *goredis.Client
	TemporalClient client.Client
	TemporalWorker worker.Worker
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

	roomsRepo := repository.NewRoomsRepository(repo.DB)
	guestsRepo := repository.NewGuestsRepository(repo.DB)
	usersLookupRepo := repository.NewUsersRepository(repo.DB)
	hotelsLookupRepo := repository.NewHotelsRepository(repo.DB)
	genkitInstance := aiflows.InitGenkit(context.Background(), &cfg.LLM, roomsRepo, guestsRepo, usersLookupRepo, hotelsLookupRepo)
	workflowClient, temporalClient, temporalWorker := tryInitTemporal(cfg, genkitInstance)
	app := setupApp()
	setupClerk(cfg)

	if err = setupRoutes(app, repo, genkitInstance, workflowClient, cfg, s3Store, openSearchRepos); err != nil { //nolint:wsl
		if e := repo.Close(); e != nil {
			return nil, errors.Join(err, e)
		}
		if temporalClient != nil {
			temporalClient.Close()
		}
		return nil, err
	}

	return &App{
		Server:         app,
		Repo:           repo,
		RedisClient:    redisClient,
		S3Storage:      s3Store,
		TemporalClient: temporalClient,
		TemporalWorker: temporalWorker,
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

func tryInitTemporal(cfg *config.Config, genkitService aiflows.GenerateRequestService) (temporalservice.GenerateRequestWorkflowClient, client.Client, worker.Worker) {
	temporalClient, err := temporalservice.NewClient(cfg.Temporal)
	if err != nil {
		log.Printf("Warning: Temporal not available: %v", err)
		return nil, nil, nil
	}

	workflowClient := temporalservice.NewService(temporalClient)
	temporalWorker := temporalservice.NewWorker(temporalClient, genkitService)
	if err := temporalWorker.Start(); err != nil {
		log.Printf("Warning: failed to start Temporal worker: %v", err)
		temporalClient.Close()
		return nil, nil, nil
	}

	return workflowClient, temporalClient, temporalWorker
}

func setupRoutes(app *fiber.App, repo *storage.Repository, genkitInstance *aiflows.GenkitService,
	workflowClient temporalservice.GenerateRequestWorkflowClient, cfg *config.Config, s3Store *s3storage.Storage, openSearchRepos openSearchRepositories) error {
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

	// initialize users and hotels repos for clerk webhook handler
	usersRepo := repository.NewUsersRepository(repo.DB)
	hotelsRepo := repository.NewHotelsRepository(repo.DB)

	// initialize notifications
	notifRepo := repository.NewNotificationsRepository(repo.DB)
	notifService := notificationssvc.NewService(notifRepo)
	notifHandler := handler.NewNotificationsHandler(notifRepo)

	// initialize handler(s)
	helloHandler := handler.NewHelloHandler()
	devsHandler := handler.NewDevsHandler(repository.NewDevsRepository(repo.DB))
	usersHandler := handler.NewUsersHandler(repository.NewUsersRepository(repo.DB), s3Store)
	guestsHandler := handler.NewGuestsHandler(repository.NewGuestsRepository(repo.DB), repository.NewUsersRepository(repo.DB), openSearchRepos.Guests)
	reqsHandler := handler.NewRequestsHandler(repository.NewRequestsRepo(repo.DB), genkitInstance, notifService)
	reqsHandler.WorkflowClient = workflowClient
	hotelsHandler := handler.NewHotelsHandler(repository.NewHotelsRepository(repo.DB), repository.NewUsersRepository(repo.DB))
	s3Handler := handler.NewS3Handler(s3Store)
	roomsHandler := handler.NewRoomsHandler(repository.NewRoomsRepository(repo.DB))
	guestBookingsHandler := handler.NewGuestBookingsHandler(repository.NewGuestBookingsRepository(repo.DB))
	viewsHandler := handler.NewViewsHandler(repository.NewViewsRepository(repo.DB))

	clerkWhSignatureVerifier, err := handler.NewWebhookVerifier(cfg)
	if err != nil {
		return err
	}
	clerkWebhookHandler := handler.NewClerkWebHookHandler(usersRepo, hotelsRepo, clerkWhSignatureVerifier)

	// API v1 routes
	api := app.Group("/api/v1")

	// clerk webhook routes
	api.Route("/clerk", func(r fiber.Router) {
		r.Post("/org-membership", clerkWebhookHandler.CreateOrgMembership)
		r.Post("/org", clerkWebhookHandler.OrgCreated)
	})

	verifier := clerk.NewClerkJWTVerifier()
	app.Use(clerk.NewAuthMiddleware(verifier))

	adminOnly := handler.AdminMiddleware(repository.NewUsersRepository(repo.DB))

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
		r.Post("/search", usersHandler.SearchUsers)
		r.Get("/:id", usersHandler.GetUserByID)
		r.Post("/", usersHandler.CreateUser)
		r.Get("/:userId/profile-picture", usersHandler.GetProfilePicture)
		r.Put("/:userId/profile-picture", usersHandler.UpdateProfilePicture)
		r.Delete("/:userId/profile-picture", usersHandler.DeleteProfilePicture)
		r.Put("/:id", usersHandler.UpdateUser)
		r.Post("/:id/departments", usersHandler.AddEmployeeDepartment)
		r.Delete("/:id/departments/:deptId", usersHandler.RemoveEmployeeDepartment)
		r.Put("/:id/onboard", usersHandler.CompleteOnboarding)
	})

	// Guest Routes
	api.Route("/guests", func(r fiber.Router) {
		r.Post("/", adminOnly, guestsHandler.CreateGuest)
		r.Post("/search", guestsHandler.GetGuests)
		r.Get("/stays/:id", guestsHandler.GetGuestWithStays)
		r.Get("/:id", guestsHandler.GetGuest)
		r.Put("/:id", adminOnly, guestsHandler.UpdateGuest)
	})

	// Request routes
	api.Post("/requests/feed", reqsHandler.GetRequestsFeed)
	api.Post("/requests/overview", reqsHandler.GetRequestsOverview)
	api.Route("/request", func(r fiber.Router) {
		r.Post("/", reqsHandler.CreateRequest)
		r.Post("/generate", reqsHandler.GenerateRequest)
		r.Post("/generate/async", reqsHandler.StartGenerateRequestAsync)
		r.Get("/generate/async/:workflowId", reqsHandler.GetGenerateRequestStatus)
		r.Put("/:id", reqsHandler.UpdateRequest)
		r.Get("/:id", reqsHandler.GetRequest)
		r.Get("/guest/:id", reqsHandler.GetRequestsByGuest)
		r.Get("/room/:id", reqsHandler.GetRequestsByRoomID)
		r.Post("/:id/assign", reqsHandler.AssignRequest)
	})

	// Hotel routes
	api.Route("/hotels", func(r fiber.Router) {
		r.Get("/:id", hotelsHandler.GetHotelByID)
		r.Post("/", hotelsHandler.CreateHotel)
		r.Get("/:id/users", hotelsHandler.GetHotelUsers)
		r.Get("/:id/departments", hotelsHandler.GetDepartmentsByHotelID)
		r.Post("/:id/departments", adminOnly, hotelsHandler.CreateDepartment)
		r.Put("/:id/departments/:deptId", adminOnly, hotelsHandler.UpdateDepartment)
		r.Delete("/:id/departments/:deptId", adminOnly, hotelsHandler.DeleteDepartment)
	})

	// s3 routes
	api.Route("/s3", func(r fiber.Router) {
		r.Get("/presigned-url/*", s3Handler.GeneratePresignedUploadURL)
		r.Get("/upload-url/:userId", s3Handler.GetUploadURL)
		r.Get("/presigned-get-url/*", s3Handler.GeneratePresignedGetURL)
	})

	// rooms routes
	api.Route("/rooms", func(r fiber.Router) {
		r.Post("/", roomsHandler.FilterRooms)
		r.Get("/floors", roomsHandler.GetFloors)
		r.Get("/:id", roomsHandler.GetRoomByID)
	})

	// guest booking routes
	api.Route("/guest_bookings", func(r fiber.Router) {
		r.Get("/group_sizes", guestBookingsHandler.GetGroupSizeOptions)
	})

	// views routes
	api.Route("/views", func(r fiber.Router) {
		r.Get("/", viewsHandler.GetAllViews)
		r.Post("/", viewsHandler.CreateView)
		r.Delete("/:id", viewsHandler.DeleteView)
	})

	// notification routes
	api.Route("/notifications", func(r fiber.Router) {
		r.Get("/", notifHandler.ListNotifications)
		r.Put("/read-all", notifHandler.MarkAllRead)
		r.Put("/:id/read", notifHandler.MarkRead)
	})

	// device token routes
	api.Route("/device-tokens", func(r fiber.Router) {
		r.Post("/", notifHandler.RegisterDeviceToken)
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
