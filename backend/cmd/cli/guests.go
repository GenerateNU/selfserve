package main

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/repository"
	opensearchstorage "github.com/generate/selfserve/internal/service/storage/opensearch"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

func runReindexGuests(ctx context.Context, cfg config.Config, _ []string) error {
	pgRepo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		return fmt.Errorf("failed to connect to db: %w", err)
	}
	defer pgRepo.Close()

	osClient, err := opensearchstorage.NewClient(cfg.OpenSearch)
	if err != nil {
		return fmt.Errorf("failed to connect to opensearch: %w", err)
	}

	if err := opensearchstorage.EnsureGuestsIndex(ctx, osClient); err != nil {
		return fmt.Errorf("failed to ensure guests index: %w", err)
	}

	guestsRepo := repository.NewGuestsRepository(pgRepo.DB)
	osGuestsRepo := repository.NewOpenSearchGuestsRepository(osClient)

	var indexed, failed int
	for doc, err := range guestsRepo.AllGuestDocuments(ctx) {
		if err != nil {
			return fmt.Errorf("failed to fetch guest documents: %w", err)
		}
		if err := osGuestsRepo.IndexGuest(ctx, doc); err != nil {
			slog.Error("failed to index guest", "id", doc.ID, "error", err)
			failed++
			continue
		}
		indexed++
	}

	fmt.Printf("reindex-guests completed: %d indexed, %d failed\n", indexed, failed)
	if failed > 0 {
		return fmt.Errorf("%d guests failed to index", failed)
	}
	return nil
}
