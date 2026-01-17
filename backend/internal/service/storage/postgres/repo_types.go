package storage

import (
	"context"

	"github.com/generate/selfserve/internal/models"
)

type UsersRepository interface {
	InsertUser(ctx context.Context, user *models.CreateUserRequest) (*models.User, error)
}

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)
}
