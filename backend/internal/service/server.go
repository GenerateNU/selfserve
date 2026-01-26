package service

import (
	"net/http"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/repository"
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

	app := setupApp()

	setupRoutes(app, repo)

	return &App{
		Server: app,
	}, nil

}

func setupRoutes(app *fiber.App, repo *storage.Repository) {
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

	// initialize handler(s)
	helloHandler := handler.NewHelloHandler()
	devsHandler := handler.NewDevsHandler(repository.NewDevsRepository(repo.DB))
	usersHandler := handler.NewUsersHandler(repository.NewUsersRepository(repo.DB))
	reqsHandler := handler.NewRequestsHandler(repository.NewRequestsRepo(repo.DB))
	hotelsHandler := handler.NewHotelsHandler(repository.NewHotelsRepo(repo.DB))

	// API v1 routes
	api := app.Group("/api/v1")

	// Hello routes
	api.Route("/hello", func(r fiber.Router) {
		r.Get("/", helloHandler.GetHello)
		r.Get("/:name", helloHandler.GetHelloName)
	})

	// Dev routes
	api.Route("/devs", func(r fiber.Router) {
		r.Get("/:name", devsHandler.GetMember)
	})

	// User Routes
	api.Route("/users", func(r fiber.Router) {
		r.Post("/", usersHandler.CreateUser)
	})

	// Request routes
	api.Route("/request", func(r fiber.Router) {
		r.Post("/", reqsHandler.CreateRequest)
		r.Get("/:id", reqsHandler.GetRequest)
	})

	// Hotel routes
	api.Route("/hotel", func(r fiber.Router) {
		r.Post("/", hotelsHandler.CreateHotel)
	})

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
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
	}))

	return app
}
