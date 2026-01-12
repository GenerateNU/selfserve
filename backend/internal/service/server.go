package service

import (
	"net/http"

	"github.com/generate/selfserve/config"
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
	// initialize health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	// initialize handler(s)
	helloHandler := handler.NewHelloHandler()

	// Hello routes
	app.Route("/hello", func(r fiber.Router) {
		r.Get("/", helloHandler.GetHello)
		r.Get("/:name", helloHandler.GetHelloName)
	})

	// dev table testing routes
	devsHandler := handler.NewDevsHandler(repository.NewDevsRepository(repo.DB))
	app.Route("/devs", func(r fiber.Router) {
		r.Get("/:name", devsHandler.GetMember)
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
