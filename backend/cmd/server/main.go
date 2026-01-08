package main

import (
	"context"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/service"
	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	// Load environment variables
	err := godotenv.Load("./config/.env")
	if err != nil {
		log.Fatal("failed to load .env:", err)
	}

	var cfg config.Config
	ctx := context.Background()
	if err := envconfig.Process(ctx, &cfg); err != nil {
		log.Fatal("failed to process config:", err)
	}

	app, err := service.InitApp(ctx, &cfg)
	if err != nil {
		log.Fatal("failed to initialize app:", err)
	}

	// TODO: defer closing of DB connection

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
