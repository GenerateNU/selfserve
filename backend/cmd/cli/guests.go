package main

import (
	"context"
	"fmt"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/repository"
	opensearchstorage "github.com/generate/selfserve/internal/service/storage/opensearch"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

const reindexBatchSize = 100

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

	var total int
	batch := make([]*models.GuestDocument, 0, reindexBatchSize)

	flush := func() error {
		if err := osGuestsRepo.BulkIndexGuests(ctx, batch); err != nil {
			return err
		}
		total += len(batch)
		batch = batch[:0]
		return nil
	}

	for doc, err := range guestsRepo.AllGuestDocuments(ctx) {
		if err != nil {
			return fmt.Errorf("failed to fetch guest documents: %w", err)
		}
		batch = append(batch, doc)
		if len(batch) == reindexBatchSize {
			if err := flush(); err != nil {
				return fmt.Errorf("failed to bulk index batch: %w", err)
			}
		}
	}

	if len(batch) > 0 {
		if err := flush(); err != nil {
			return fmt.Errorf("failed to bulk index batch: %w", err)
		}
	}

	fmt.Printf("reindex-guests completed: %d indexed\n", total)
	return nil
}
