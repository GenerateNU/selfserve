package service

import (
	"context"
	"net/http"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/service/handler/hello"
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

func InitApp(ctx context.Context, cfg *config.Config) (*App, error) {
	// Init DB/repository(ies)
	app := setupApp()

	// TODO: setup repo / DB accessor for CRUD operations
	setupRoutes(app, cfg)

	return &App{
		Server: app,
	}, nil

}

// TODO: setup repo for DB, no DB accessor needed for these test routes yet
func setupRoutes(app *fiber.App, cfg *config.Config) {

	// initialize health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	// initialize handler(s)
	helloHandler := hello.NewHandler()

	// setup routes
	// Hello routes
	app.Route("/hello", func(r fiber.Router) {
		r.Get("/", helloHandler.GetHello)
		r.Get("/:name", helloHandler.GetHelloName)
	})
}

// Initialize Fiber app with middlewares / configs
func setupApp() *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
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
