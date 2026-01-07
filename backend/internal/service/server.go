package service

import (
	"context"
	"net/http"

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
	Config *fiber.App
	Repo   *storage.Repository
}

func InitApp(ctx context.Context, config *fiber.App, repo *storage.Repository) (*App, error) {
	app := setupApp()

	// TODO: setup repo for DB
	repo := postgres.NewRepository(ctx, config.DB)
	setupRoutes(app, repo, config)

	return &App{
		Config: app,
		Repo:   repo,
	}, nil

}

func setupRoutes(app *fiber.App, repo *storage.Repository, config config.Config) {

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
		r.Get("/:id", helloHandler.GetHelloName)
	})
}

// Initialize Fiber app with middlewares / configs
func setupApp() *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: go_json.Marshal,
		JSONDecoder: go_json.Unmarshal,
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
