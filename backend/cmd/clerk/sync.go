package main

import (
	"context"
	"fmt"
	"log"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/service/clerk"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	ctx := context.Background()
	var cfg config.Config
	if err := envconfig.Process(ctx, &cfg); err != nil {
		log.Fatal("failed to process config:", err)
	}

	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	defer repo.Close()
	usersRepo := repository.NewUsersRepository(repo.DB)

	path := "/users"
	err = syncUsers(ctx, cfg.BaseURL + path, cfg.SecretKey, usersRepo)
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

