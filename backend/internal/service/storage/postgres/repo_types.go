package storage

import (
	"context"
	"github.com/generate/selfserve/internal/models"
)

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)
}
