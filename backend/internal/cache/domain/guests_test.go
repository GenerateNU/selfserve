package domain

import (
	"context"
	"testing"

	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type stubGuestsRepo struct {
	findGuestFn      func(ctx context.Context, id string) (*models.Guest, error)
	findGuestStaysFn func(ctx context.Context, id string) (*models.GuestWithStays, error)
	updateGuestFn    func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error)
}

func (s *stubGuestsRepo) InsertGuest(_ context.Context, guest *models.CreateGuest) (*models.Guest, error) {
	return &models.Guest{CreateGuest: *guest}, nil
}
func (s *stubGuestsRepo) FindGuest(ctx context.Context, id string) (*models.Guest, error) {
	return s.findGuestFn(ctx, id)
}
func (s *stubGuestsRepo) UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
	return s.updateGuestFn(ctx, id, update)
}
func (s *stubGuestsRepo) FindGuestsWithActiveBooking(_ context.Context, _ *models.GuestFilters) (*models.GuestPage, error) {
	return nil, nil
}
func (s *stubGuestsRepo) FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error) {
	return s.findGuestStaysFn(ctx, id)
}

var _ storage.GuestsRepository = (*stubGuestsRepo)(nil)

func TestCachedGuestsRepositoryCachesStayHistory(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeDomainStore{}
	repo := &stubGuestsRepo{
		findGuestFn: func(context.Context, string) (*models.Guest, error) { return nil, nil },
		findGuestStaysFn: func(_ context.Context, id string) (*models.GuestWithStays, error) {
			return &models.GuestWithStays{ID: id, FirstName: "Ada"}, nil
		},
		updateGuestFn: func(context.Context, string, *models.UpdateGuest) (*models.Guest, error) { return nil, nil },
	}

	cached := NewCachedGuestsRepository(object.New(cacheStore), repo)
	guest, err := cached.FindGuestWithStayHistory(context.Background(), "guest-1")

	require.NoError(t, err)
	assert.Equal(t, "Ada", guest.FirstName)
	assert.Equal(t, guestStayHistoryKey("guest-1"), cacheStore.lastSetKey)
}

func TestCachedGuestsRepositoryCachesFindGuest(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeDomainStore{}
	repo := &stubGuestsRepo{
		findGuestFn: func(_ context.Context, id string) (*models.Guest, error) {
			return &models.Guest{ID: id, CreateGuest: models.CreateGuest{FirstName: "Ada"}}, nil
		},
		findGuestStaysFn: func(context.Context, string) (*models.GuestWithStays, error) { return nil, nil },
		updateGuestFn:    func(context.Context, string, *models.UpdateGuest) (*models.Guest, error) { return nil, nil },
	}

	cached := NewCachedGuestsRepository(object.New(cacheStore), repo)
	guest, err := cached.FindGuest(context.Background(), "guest-1")

	require.NoError(t, err)
	assert.Equal(t, "Ada", guest.FirstName)
	assert.Equal(t, guestKey("guest-1"), cacheStore.lastSetKey)
}

func TestCachedGuestsRepositoryUpdateGuestInvalidatesBothKeys(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeDomainStore{
		values: map[string]string{
			guestKey("guest-1"):            `{"id":"guest-1"}`,
			guestStayHistoryKey("guest-1"): `{"id":"guest-1"}`,
		},
	}
	repo := &stubGuestsRepo{
		findGuestFn:      func(context.Context, string) (*models.Guest, error) { return nil, nil },
		findGuestStaysFn: func(context.Context, string) (*models.GuestWithStays, error) { return nil, nil },
		updateGuestFn: func(_ context.Context, id string, _ *models.UpdateGuest) (*models.Guest, error) {
			return &models.Guest{ID: id}, nil
		},
	}

	cached := NewCachedGuestsRepository(object.New(cacheStore), repo)
	_, err := cached.UpdateGuest(context.Background(), "guest-1", &models.UpdateGuest{})

	require.NoError(t, err)
	_, guestCached := cacheStore.values[guestKey("guest-1")]
	_, stayCached := cacheStore.values[guestStayHistoryKey("guest-1")]
	assert.False(t, guestCached)
	assert.False(t, stayCached)
}
