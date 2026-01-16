package storage

import (
	"context"

	"github.com/generate/selfserve/internal/models"
)

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)

	GetRequest(ctx context.Context, id string) (*models.Request, error)
}
