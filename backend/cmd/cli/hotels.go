package main

import (
	"context"
	"fmt"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

func runBackfillHotelDepartments(ctx context.Context, cfg config.Config, _ []string) error {
	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		return fmt.Errorf("failed to connect to db: %w", err)
	}
	defer repo.Close()

	hotelsRepo := repository.NewHotelsRepository(repo.DB)

	var total int
	for hotel, err := range hotelsRepo.AllHotelsWithoutDepartments(ctx) {
		if err != nil {
			return fmt.Errorf("failed to fetch hotels: %w", err)
		}
		if err := hotelsRepo.InsertDefaultDepartments(ctx, hotel.ID); err != nil {
			return fmt.Errorf("failed to insert departments for hotel %s: %w", hotel.ID, err)
		}
		total++
	}

	fmt.Printf("backfill-hotel-departments completed: %d hotels seeded\n", total)
	return nil
}
