package storage

import (
	"context"
	"time"

	"github.com/generate/selfserve/internal/models"
)

type NotificationsRepository interface {
	InsertNotification(ctx context.Context, userID string, notifType models.NotificationType, title, body string) (*models.Notification, error)
	FindByUserID(ctx context.Context, userID string) ([]*models.Notification, error)
	MarkRead(ctx context.Context, id, userID string) error
	MarkAllRead(ctx context.Context, userID string) error
	UpsertDeviceToken(ctx context.Context, userID, token, platform string) error
	FindDeviceTokensByUserID(ctx context.Context, userID string) ([]string, error)
}

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

// GuestsSearchRepository is implemented by OpenSearch. It handles
// indexing and searching the denormalized GuestDocument.
type GuestsSearchRepository interface {
	IndexGuest(ctx context.Context, doc *models.GuestDocument) error
	SearchGuests(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error)
	DeleteGuest(ctx context.Context, id string) error
}

type RequestsRepository interface {
	InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error)
	FindRequest(ctx context.Context, id string) (*models.Request, error)
	FindRequests(ctx context.Context) ([]models.Request, error)
	FindRequestsByStatusPaginated(ctx context.Context, cursor string, status string, hotelID string, pageSize int) ([]*models.Request, string, error)
	FindRequestsByGuestID(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error)
}

type HotelsRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}

type RoomsRepository interface {
	FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error)
	FindAllFloors(ctx context.Context, hotelID string) ([]int, error)
}
