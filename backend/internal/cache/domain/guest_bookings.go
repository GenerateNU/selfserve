package domain

import (
	"context"
	"time"

	"github.com/generate/selfserve/internal/cache/object"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

type CachedGuestBookingsRepository struct {
	cache *object.Cache
	next  storage.GuestBookingsRepository
}

func NewCachedGuestBookingsRepository(cache *object.Cache, next storage.GuestBookingsRepository) *CachedGuestBookingsRepository {
	return &CachedGuestBookingsRepository{cache: cache, next: next}
}

func (r *CachedGuestBookingsRepository) FindGroupSizeOptions(ctx context.Context, hotelID string) ([]int, error) {
	if r.cache == nil {
		return r.next.FindGroupSizeOptions(ctx, hotelID)
	}

	key := guestBookingGroupSizesKey(hotelID)
	var cached []int
	if hit, err := r.cache.Get(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return cached, nil
	}

	sizes, err := r.next.FindGroupSizeOptions(ctx, hotelID)
	if err != nil {
		return nil, err
	}

	if err := r.cache.Set(ctx, key, sizes, guestBookingGroupSizesTTL); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return sizes, nil
}

func (r *CachedGuestBookingsRepository) InsertGuestBooking(ctx context.Context, guestID, roomID, hotelID string, arrivalDate, departureDate time.Time) error {
	// Future guest booking writes should invalidate hotel group sizes and affected guest stay history.
	return r.next.InsertGuestBooking(ctx, guestID, roomID, hotelID, arrivalDate, departureDate)
}
