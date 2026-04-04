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
	FindUser(ctx context.Context, id string) (*models.User, error)
	InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error)
	UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error)
	UpdateProfilePicture(ctx context.Context, userId string, key string) error
	DeleteProfilePicture(ctx context.Context, userId string) error
	GetKey(ctx context.Context, userId string) (string, error)
	BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error
	SearchUsersByHotel(ctx context.Context, hotelID, cursor, query string, limit int) ([]*models.User, string, error)
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
	FindMyRequestsByRoomID(ctx context.Context, roomID, hotelID, userID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error)
	FindUnassignedRequestsByRoomID(ctx context.Context, roomID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error)
}

type HotelsRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}

// S3Storage defines the interface for S3 operations
type S3Storage interface {
	GeneratePresignedUploadURL(ctx context.Context, in models.PresignedURLInput) (string, error)
	GeneratePresignedGetURL(ctx context.Context, in models.PresignedURLInput) (string, error)
	DeleteFile(ctx context.Context, key string) error
}
type RoomsRepository interface {
	FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error)
	FindAllFloors(ctx context.Context, hotelID string) ([]int, error)
	FindRoomByNumber(ctx context.Context, hotelID string, roomReference string) (*models.Room, error)
}
