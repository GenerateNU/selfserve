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
	FindGuestsWithActiveBooking(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error)
	FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error)
}

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)
	FindRequest(ctx context.Context, id string) (*models.Request, error)
	FindRequests(ctx context.Context) ([]models.Request, error)
	FindRequestsByStatusPaginated(ctx context.Context, cursor string, status string, hotelID string, pageSize int) ([]*models.Request, string, error)
}

type HotelsRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}

type RoomsRepository interface {
	FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.RoomFilters, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error)
	FindAllFloors(ctx context.Context, hotelID string) ([]int, error)
}
