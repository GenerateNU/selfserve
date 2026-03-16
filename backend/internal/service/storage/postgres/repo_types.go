package storage

import (
	"context"

	"github.com/generate/selfserve/internal/models"
)

type UsersRepository interface {
	InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error)
	BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error
}

type GuestsRepository interface {
	InsertGuest(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error)
	FindGuest(ctx context.Context, id string) (*models.Guest, error)
	UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error)
	FindGuests(ctx context.Context, filters *models.GuestFilter) (*models.GuestPage, error)
	FindGuestWithStays(ctx context.Context, id string) (*models.GuestWithStays, error)
}

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)

	FindRequest(ctx context.Context, id string) (*models.Request, error)

	FindRequests(ctx context.Context) ([]models.Request, error)
}

type HotelsRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}
