package main

import (
	"context"
	"fmt"
	"log"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/repository"
	"github.com/generate/selfserve/internal/service/clerk"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/sethvargo/go-envconfig"
)

type syncConfig struct {
	DB    config.DB `env:",prefix=DB_"`
	Clerk syncClerk `env:",prefix=CLERK_"`
}

type syncClerk struct {
	BaseURL   string `env:"BASE_URL" envDefault:"https://api.clerk.com/v1"`
	SecretKey string `env:"SECRET_KEY,required"`
}

func main() {
	ctx := context.Background()
	var cfg syncConfig
	if err := envconfig.Process(ctx, &cfg); err != nil {
		log.Fatal("failed to process config:", err)
	}

	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	defer repo.Close()
	usersRepo := repository.NewUsersRepository(repo.DB)

	err = syncUsers(ctx, cfg.Clerk.BaseURL+"/users", cfg.Clerk.SecretKey, usersRepo)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Sync completed successfully")
}

func syncUsers(ctx context.Context, clerkBaseURL string, clerkSecret string,
	usersRepo storage.UsersRepository) error {

	users, err := clerk.FetchUsersFromClerk(clerkBaseURL, clerkSecret)
	if err != nil {
		return err
	}

	transformed, err := clerk.ValidateAndReformatUserData(users)
	if err != nil {
		return err
	}

	if err := usersRepo.BulkInsertUsers(ctx, transformed); err != nil {
		return fmt.Errorf("failed to insert users: %w", err)
	}

	return nil
}
