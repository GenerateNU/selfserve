package domain

import (
	"context"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/cache/object"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type stubGuestBookingsRepo struct {
	findGroupSizeOptionsFn func(ctx context.Context, hotelID string) ([]int, error)
}

func (s *stubGuestBookingsRepo) FindGroupSizeOptions(ctx context.Context, hotelID string) ([]int, error) {
	return s.findGroupSizeOptionsFn(ctx, hotelID)
}
func (s *stubGuestBookingsRepo) InsertGuestBooking(_ context.Context, _, _, _ string, _, _ time.Time) error {
	return nil
}

var _ storage.GuestBookingsRepository = (*stubGuestBookingsRepo)(nil)

func TestCachedGuestBookingsRepositoryUsesHotelScopedKey(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeDomainStore{}
	repo := &stubGuestBookingsRepo{
		findGroupSizeOptionsFn: func(context.Context, string) ([]int, error) {
			return []int{1, 2, 4}, nil
		},
	}

	cached := NewCachedGuestBookingsRepository(object.New(cacheStore), repo)
	sizes, err := cached.FindGroupSizeOptions(context.Background(), "hotel-1")

	require.NoError(t, err)
	assert.Equal(t, []int{1, 2, 4}, sizes)
	assert.Equal(t, guestBookingGroupSizesKey("hotel-1"), cacheStore.lastSetKey)
}
