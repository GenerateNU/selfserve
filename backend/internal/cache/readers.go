package cache

import (
	"context"
	"time"

	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

const keyPrefix = "selfserve:v1"

type UsersRepository interface {
	FindUser(ctx context.Context, id string) (*models.User, error)
	InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error)
	UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error)
	UpdateProfilePicture(ctx context.Context, userID string, key string) error
	DeleteProfilePicture(ctx context.Context, userID string) error
	GetKey(ctx context.Context, userID string) (string, error)
	BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error
	SearchUsersByHotel(ctx context.Context, hotelID, cursor, query string, limit int) ([]*models.User, string, error)
}

type HotelsRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}

type GuestBookingsReader interface {
	FindGroupSizeOptions(ctx context.Context, hotelID string) ([]int, error)
}

type CachedUsersRepository struct {
	cache *JSONCache
	next  UsersRepository
	ttl   time.Duration
}

type CachedHotelsRepository struct {
	cache *JSONCache
	next  HotelsRepository
	ttl   time.Duration
}

type CachedGuestsRepository struct {
	cache         *JSONCache
	next          storage.GuestsRepository
	guestTTL      time.Duration
	guestStaysTTL time.Duration
}

type CachedGuestBookingsRepository struct {
	cache *JSONCache
	next  GuestBookingsReader
	ttl   time.Duration
}

func NewCachedUsersRepository(cache *JSONCache, next UsersRepository, ttl time.Duration) *CachedUsersRepository {
	return &CachedUsersRepository{cache: cache, next: next, ttl: ttl}
}

func NewCachedHotelsRepository(cache *JSONCache, next HotelsRepository, ttl time.Duration) *CachedHotelsRepository {
	return &CachedHotelsRepository{cache: cache, next: next, ttl: ttl}
}

func NewCachedGuestsRepository(cache *JSONCache, next storage.GuestsRepository, guestTTL, guestStaysTTL time.Duration) *CachedGuestsRepository {
	return &CachedGuestsRepository{cache: cache, next: next, guestTTL: guestTTL, guestStaysTTL: guestStaysTTL}
}

func NewCachedGuestBookingsRepository(cache *JSONCache, next GuestBookingsReader, ttl time.Duration) *CachedGuestBookingsRepository {
	return &CachedGuestBookingsRepository{cache: cache, next: next, ttl: ttl}
}

func (r *CachedUsersRepository) FindUser(ctx context.Context, id string) (*models.User, error) {
	if r.cache == nil {
		return r.next.FindUser(ctx, id)
	}
	key := userKey(id)

	var cached models.User
	if hit, err := r.cache.GetJSON(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	user, err := r.next.FindUser(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.SetJSON(ctx, key, user, r.ttl); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return user, nil
}

func (r *CachedUsersRepository) InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error) {
	return r.next.InsertUser(ctx, user)
}

func (r *CachedUsersRepository) UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error) {
	return r.next.UpdateUser(ctx, id, update)
}

func (r *CachedUsersRepository) UpdateProfilePicture(ctx context.Context, userID string, key string) error {
	return r.next.UpdateProfilePicture(ctx, userID, key)
}

func (r *CachedUsersRepository) DeleteProfilePicture(ctx context.Context, userID string) error {
	return r.next.DeleteProfilePicture(ctx, userID)
}

func (r *CachedUsersRepository) GetKey(ctx context.Context, userID string) (string, error) {
	return r.next.GetKey(ctx, userID)
}

func (r *CachedUsersRepository) BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error {
	return r.next.BulkInsertUsers(ctx, users)
}

func (r *CachedUsersRepository) SearchUsersByHotel(
	ctx context.Context,
	hotelID, cursor, query string,
	limit int,
) ([]*models.User, string, error) {
	return r.next.SearchUsersByHotel(ctx, hotelID, cursor, query, limit)
}

func (r *CachedHotelsRepository) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
	if r.cache == nil {
		return r.next.FindByID(ctx, id)
	}
	key := hotelKey(id)

	var cached models.Hotel
	if hit, err := r.cache.GetJSON(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	hotel, err := r.next.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.SetJSON(ctx, key, hotel, r.ttl); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return hotel, nil
}

func (r *CachedHotelsRepository) InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	return r.next.InsertHotel(ctx, hotel)
}

func (r *CachedGuestsRepository) InsertGuest(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
	return r.next.InsertGuest(ctx, guest)
}

func (r *CachedGuestsRepository) FindGuest(ctx context.Context, id string) (*models.Guest, error) {
	if r.cache == nil {
		return r.next.FindGuest(ctx, id)
	}
	key := guestKey(id)

	var cached models.Guest
	if hit, err := r.cache.GetJSON(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	guest, err := r.next.FindGuest(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.SetJSON(ctx, key, guest, r.guestTTL); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return guest, nil
}

func (r *CachedGuestsRepository) UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
	return r.next.UpdateGuest(ctx, id, update)
}

func (r *CachedGuestsRepository) FindGuestsWithActiveBooking(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error) {
	return r.next.FindGuestsWithActiveBooking(ctx, filters)
}

func (r *CachedGuestsRepository) FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error) {
	if r.cache == nil {
		return r.next.FindGuestWithStayHistory(ctx, id)
	}
	key := guestStaysKey(id)

	var cached models.GuestWithStays
	if hit, err := r.cache.GetJSON(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	guest, err := r.next.FindGuestWithStayHistory(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.SetJSON(ctx, key, guest, r.guestStaysTTL); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return guest, nil
}

func (r *CachedGuestBookingsRepository) FindGroupSizeOptions(ctx context.Context, hotelID string) ([]int, error) {
	if r.cache == nil {
		return r.next.FindGroupSizeOptions(ctx, hotelID)
	}
	key := guestBookingGroupSizesKey(hotelID)

	var cached []int
	if hit, err := r.cache.GetJSON(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return cached, nil
	}

	sizes, err := r.next.FindGroupSizeOptions(ctx, hotelID)
	if err != nil {
		return nil, err
	}

	if err := r.cache.SetJSON(ctx, key, sizes, r.ttl); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return sizes, nil
}

func userKey(id string) string {
	return keyPrefix + ":user:" + id
}

func hotelKey(id string) string {
	return keyPrefix + ":hotel:" + id
}

func guestKey(id string) string {
	return keyPrefix + ":guest:" + id
}

func guestStaysKey(id string) string {
	return keyPrefix + ":guest_stays:" + id
}

func guestBookingGroupSizesKey(hotelID string) string {
	return keyPrefix + ":guest_booking_group_sizes:" + hotelID
}
