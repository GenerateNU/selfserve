package service

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"

	clerksdk "github.com/clerk/clerk-sdk-go/v2"
	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/repository"
	"github.com/generate/selfserve/internal/service/clerk"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/favicon"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

type App struct {
	Server *fiber.App
	Repo   *storage.Repository
}

func InitApp(cfg *config.Config) (*App, error) {
	// Init DB/repository(ies)
	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		return nil, err
	}

	genkitInstance := aiflows.InitGenkit(context.Background(), &cfg.LLM)

	app := setupApp()
	setupClerk(cfg)

	if err = setupRoutes(app, repo, genkitInstance, cfg); err != nil {
		if e := repo.Close(); e != nil {
			return nil, errors.Join(err, e)
		}
		return nil, err
	}

	return &App{
		Server: app,
		Repo:   repo,
	}, nil

}

func setupRoutes(app *fiber.App, repo *storage.Repository, genkitInstance *aiflows.GenkitService,
	 cfg *config.Config) error {

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
	guestsHandler := handler.NewGuestsHandler(repository.NewGuestsRepository(repo.DB))
	reqsHandler := handler.NewRequestsHandler(repository.NewRequestsRepo(repo.DB), genkitInstance)
	hotelHandler := handler.NewHotelHandler(repository.NewHotelRepository(repo.DB))
	hotelsHandler := handler.NewHotelsHandler(repository.NewHotelsRepo(repo.DB))
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
	})

	// Guest Routes
	api.Route("/guests", func(r fiber.Router) {
		r.Post("/", guestsHandler.CreateGuest)
		r.Get("/:id", guestsHandler.GetGuest)
		r.Put("/:id", guestsHandler.UpdateGuest)
	})

	// Request routes
	api.Route("/request", func(r fiber.Router) {
		r.Post("/", reqsHandler.CreateRequest)
		r.Post("/generate", reqsHandler.GenerateRequest)
		r.Get("/:id", reqsHandler.GetRequest)
	})

	// Hotel routes
	api.Route("/hotels", func(r fiber.Router) {
		r.Get("/:id", hotelHandler.GetHotelByID)
	})

	api.Route("/hotel", func(r fiber.Router) {
		r.Post("/", hotelsHandler.CreateHotel)
	})

	return nil
}

// Initialize Fiber app with middlewares / configs
func setupApp() *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder:  json.Marshal,
		JSONDecoder:  json.Unmarshal,
		ErrorHandler: errs.ErrorHandler,
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

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000, http://localhost:8081",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin, Content-Type, Authorization",
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
