package main

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/repository"
	"github.com/generate/selfserve/internal/service/clerk"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

func runSyncUsers(ctx context.Context, cfg config.Config, _ []string) error {
	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		return fmt.Errorf("failed to connect to db: %w", err)
	}
	defer repo.Close()

	usersRepo := repository.NewUsersRepository(repo.DB)
	hotelsRepo := repository.NewHotelsRepository(repo.DB)

	users, err := clerk.FetchUsersFromClerk(cfg.Clerk.BaseURL, cfg.Clerk.SecretKey)
	if err != nil {
		return fmt.Errorf("failed to fetch users: %w", err)
	}

	for _, u := range users {
		orgID, err := clerk.FetchUserOrgID(cfg.Clerk.BaseURL, cfg.Clerk.SecretKey, u.ID)
		if err != nil {
			log.Printf("failed to fetch org for user %s: %v", u.ID, err)
			continue
		}
		if orgID == "" {
			log.Printf("skipping user %s: no org membership found", u.ID)
			continue
		}

		_, err = hotelsRepo.InsertHotel(ctx, &models.CreateHotelRequest{
			ID:   orgID,
			Name: "Synced Hotel: " + orgID,
		})
		if err != nil && !errors.Is(err, errs.ErrAlreadyExistsInDB) {
			log.Printf("failed to insert hotel %s: %v", orgID, err)
			continue
		}

		createUser := &models.CreateUser{
			ID:             u.ID,
			FirstName:      u.FirstName,
			LastName:       u.LastName,
			HotelID:        orgID,
			ProfilePicture: u.ImageUrl,
		}

		if _, err := usersRepo.InsertUser(ctx, createUser); err != nil {
			log.Printf("failed to insert user %s: %v", u.ID, err)
			continue
		}

		log.Printf("inserted user %s", u.ID)
	}

	fmt.Println("sync-users completed successfully")
	return nil
}