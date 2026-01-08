package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/generate/selfserve/config"
	errs "github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/service"
	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		errs.FatalError("failed to load .env:", err)
	}

	var cfg config.Config
	ctx := context.Background()
	if err := envconfig.Process(ctx, &cfg); err != nil {
		errs.FatalError("failed to process config:", err)
	}

	app, err := service.InitApp(ctx, &cfg)
	if err != nil {
		errs.FatalError("failed to initialize app:", err)
	}

	// TODO: defer closing of DB connection

	go func() {
		if err := app.Server.Listen(":" + cfg.Application.Port); err != nil {
			errs.FatalError("Failed to start server:", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Server is shutting down...")

	if err := app.Server.ShutdownWithContext(ctx); err != nil {
		errs.FatalError("Failed to shutdown server:", err)
	}

	slog.Info("Server shut down successfully")

}
