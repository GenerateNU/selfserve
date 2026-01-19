package main

import (
	"context"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/generate/selfserve/config"
	_ "github.com/generate/selfserve/docs"
	"github.com/generate/selfserve/internal/service"
	"github.com/sethvargo/go-envconfig"
)

// @title           SelfServe API
// @version         1.0
// @description     SelfServe backend API documentation
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@selfserve.com

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8080
// @BasePath  /api/v1

// @schemes http https
func main() {
	// Load environment variables
	ctx := context.Background()
	var cfg config.Config
	if err := envconfig.Process(ctx, &cfg); err != nil {
		log.Fatal("failed to process config:", err)
	}

	app, err := service.InitApp(&cfg)
	if err != nil {
		log.Fatal("failed to initialize app:", err)
	}

	defer app.Repo.Close()

	go func() {
		if err := app.Server.Listen(":" + cfg.Application.Port); err != nil {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Server is shutting down...")

	if err := app.Server.ShutdownWithContext(ctx); err != nil {
		log.Fatal("Failed to shutdown server:", err)
	}

	slog.Info("Server shut down successfully")

}
