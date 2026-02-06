package storage

import (
	"context"
	"time"

	"github.com/generate/selfserve/internal/models"
)

type UsersRepository interface {
	FindUser(ctx context.Context, id string) (*models.User, error)
	InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error)
	UpdateProfilePicture(ctx context.Context, userId string, key string) error
	DeleteProfilePicture(ctx context.Context, userId string) error
	GetKey(ctx context.Context, userId string) (string, error)
	BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error
}

type GuestsRepository interface {
	InsertGuest(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error)
	FindGuest(ctx context.Context, id string) (*models.Guest, error)
	UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error)
}

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)

	FindRequest(ctx context.Context, id string) (*models.Request, error)
}

type HotelRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
}

type HotelsRepository interface {
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}

// S3Storage defines the interface for S3 operations
type S3Storage interface {
	GeneratePresignedURL(ctx context.Context, key string, expiration time.Duration) (string, error)
	GeneratePresignedGetURL(ctx context.Context, key string, expiration time.Duration) (string, error)
	DeleteFile(ctx context.Context, key string) error
}
