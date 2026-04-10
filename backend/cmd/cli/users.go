package main

import (
	"context"
	"fmt"
	"log"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/repository"
	"github.com/generate/selfserve/internal/service/clerk"
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

	err = syncUsers(ctx, cfg.BaseURL, cfg.SecretKey, usersRepo)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Sync completed successfully")
}

func syncUsers(ctx context.Context, clerkBaseURL string, clerkSecret string,
	usersRepo storage.UsersRepository) error {

	users, err := clerk.FetchUsersFromClerk(clerkBaseURL+"/users", clerkSecret);
	if err != nil {
		return fmt.Errorf("failed to fetch users: %w", err);
	}

	for _, u := range users {
		if len(u.OrganizationMemberships) == 0 {
			log.Printf("skipping user %s: no org membership found", u.ID);
			continue;
		}

		orgID := u.OrganizationMemberships[0].Organization.ID

		createUser := &models.CreateUser{
			ID:             u.ID,
			FirstName:      u.FirstName,
			LastName:       u.LastName,
			HotelID:        orgID,
			ProfilePicture: u.ImageUrl,
		}

		if _, err := usersRepo.InsertUser(ctx, createUser); err != nil {
			log.Printf("failed to insert user %s: %v", u.ID, err);
			continue;
		}

		log.Printf("inserted user %s", u.ID);
	}

	return nil
}