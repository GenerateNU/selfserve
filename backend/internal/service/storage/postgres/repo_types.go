package storage

import (
	"context"
	"github.com/generate/selfserve/internal/models"
)

type RequestRepository interface {
	MakeRequest(ctx context.Context, req *models.Request) (*models.Request, error)
} 
