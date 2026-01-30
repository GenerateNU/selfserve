package storage

import (
	"context"

	"github.com/generate/selfserve/internal/models"
)

type UsersRepository interface {
	InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error)
}

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)

	FindRequest(ctx context.Context, id string) (*models.Request, error)

	FindRequests(ctx context.Context) ([]models.Request, error)
}

type HotelRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
}

type HotelsRepository interface {
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}
