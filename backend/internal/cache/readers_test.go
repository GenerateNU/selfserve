package cache

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type stubUsersRepo struct {
	findUserCalls int
	findUserFn    func(ctx context.Context, id string) (*models.User, error)
}

func (s *stubUsersRepo) FindUser(ctx context.Context, id string) (*models.User, error) {
	s.findUserCalls++
	return s.findUserFn(ctx, id)
}

func (s *stubUsersRepo) InsertUser(_ context.Context, user *models.CreateUser) (*models.User, error) {
	return &models.User{CreateUser: *user}, nil
}

func (s *stubUsersRepo) UpdateUser(_ context.Context, id string, update *models.UpdateUser) (*models.User, error) {
	return &models.User{CreateUser: models.CreateUser{ID: id, PhoneNumber: update.PhoneNumber}}, nil
}

func (s *stubUsersRepo) UpdateProfilePicture(_ context.Context, _ string, _ string) error {
	return nil
}

func (s *stubUsersRepo) DeleteProfilePicture(_ context.Context, _ string) error {
	return nil
}

func (s *stubUsersRepo) GetKey(_ context.Context, _ string) (string, error) {
	return "", nil
}

func (s *stubUsersRepo) BulkInsertUsers(_ context.Context, _ []*models.CreateUser) error {
	return nil
}

func (s *stubUsersRepo) SearchUsersByHotel(
	_ context.Context,
	_, _, _ string,
	_ int,
) ([]*models.User, string, error) {
	return nil, "", nil
}

type stubHotelsRepo struct {
	findByIDCalls int
	findByIDFn    func(ctx context.Context, id string) (*models.Hotel, error)
}

func (s *stubHotelsRepo) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
	s.findByIDCalls++
	return s.findByIDFn(ctx, id)
}

func (s *stubHotelsRepo) InsertHotel(_ context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	return &models.Hotel{CreateHotelRequest: *hotel}, nil
}

type stubGuestsRepo struct {
	findGuestCalls      int
	findGuestStaysCalls int
	findGuestFn         func(ctx context.Context, id string) (*models.Guest, error)
	findGuestStaysFn    func(ctx context.Context, id string) (*models.GuestWithStays, error)
}

func (s *stubGuestsRepo) InsertGuest(_ context.Context, guest *models.CreateGuest) (*models.Guest, error) {
	return &models.Guest{CreateGuest: *guest}, nil
}

func (s *stubGuestsRepo) FindGuest(ctx context.Context, id string) (*models.Guest, error) {
	s.findGuestCalls++
	return s.findGuestFn(ctx, id)
}

func (s *stubGuestsRepo) UpdateGuest(_ context.Context, id string, _ *models.UpdateGuest) (*models.Guest, error) {
	return &models.Guest{ID: id}, nil
}

func (s *stubGuestsRepo) FindGuestsWithActiveBooking(_ context.Context, _ *models.GuestFilters) (*models.GuestPage, error) {
	return nil, nil
}

func (s *stubGuestsRepo) FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error) {
	s.findGuestStaysCalls++
	return s.findGuestStaysFn(ctx, id)
}

type stubGuestBookingsRepo struct {
	findGroupSizeCalls int
	findGroupSizeFn    func(ctx context.Context, hotelID string) ([]int, error)
}

func (s *stubGuestBookingsRepo) FindGroupSizeOptions(ctx context.Context, hotelID string) ([]int, error) {
	s.findGroupSizeCalls++
	return s.findGroupSizeFn(ctx, hotelID)
}

var _ storage.GuestsRepository = (*stubGuestsRepo)(nil)

func TestCachedUsersRepository_FindUserUsesCacheHit(t *testing.T) {
	t.Parallel()

	store := &fakeKVStore{
		values: map[string]string{
			"selfserve:v1:user:user-1": `{"id":"user-1","first_name":"Ada"}`,
		},
	}
	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, _ string) (*models.User, error) {
			t.Fatal("repository should not be called on cache hit")
			return nil, nil
		},
	}

	cached := NewCachedUsersRepository(NewJSONCache(store), repo, 5*time.Minute)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, "user-1", user.ID)
	assert.Equal(t, "Ada", user.FirstName)
	assert.Equal(t, 0, repo.findUserCalls)
}

func TestCachedUsersRepository_FindUserCachesRepositoryResult(t *testing.T) {
	t.Parallel()

	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, id string) (*models.User, error) {
			return &models.User{CreateUser: models.CreateUser{ID: id, FirstName: "Ada"}}, nil
		},
	}
	store := &fakeKVStore{}

	cached := NewCachedUsersRepository(NewJSONCache(store), repo, 5*time.Minute)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, 1, repo.findUserCalls)
	assert.Equal(t, "Ada", user.FirstName)
	assert.Equal(t, "selfserve:v1:user:user-1", store.lastSetKey)
	assert.Equal(t, 5*time.Minute, store.lastSetTTL)
	assert.Contains(t, store.lastSetValue, `"id":"user-1"`)
	assert.Contains(t, store.lastSetValue, `"first_name":"Ada"`)
}

func TestCachedUsersRepository_FindUserFallsBackWhenCacheReadFails(t *testing.T) {
	t.Parallel()

	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, id string) (*models.User, error) {
			return &models.User{CreateUser: models.CreateUser{ID: id, FirstName: "Ada"}}, nil
		},
	}
	store := &fakeKVStore{getErr: errors.New("redis unavailable")}

	cached := NewCachedUsersRepository(NewJSONCache(store), repo, 5*time.Minute)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, 1, repo.findUserCalls)
	assert.Equal(t, "Ada", user.FirstName)
}

func TestCachedUsersRepository_FindUserDoesNotCacheNotFound(t *testing.T) {
	t.Parallel()

	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, _ string) (*models.User, error) {
			return nil, errs.ErrNotFoundInDB
		},
	}
	store := &fakeKVStore{}

	cached := NewCachedUsersRepository(NewJSONCache(store), repo, 5*time.Minute)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.ErrorIs(t, err, errs.ErrNotFoundInDB)
	assert.Nil(t, user)
	assert.Equal(t, "", store.lastSetKey)
}

func TestCachedHotelsRepository_FindByIDUsesCacheKey(t *testing.T) {
	t.Parallel()

	repo := &stubHotelsRepo{
		findByIDFn: func(_ context.Context, id string) (*models.Hotel, error) {
			return &models.Hotel{ID: id, CreateHotelRequest: models.CreateHotelRequest{Name: "Hotel One"}}, nil
		},
	}
	store := &fakeKVStore{}

	cached := NewCachedHotelsRepository(NewJSONCache(store), repo, 15*time.Minute)
	hotel, err := cached.FindByID(context.Background(), "hotel-1")

	require.NoError(t, err)
	assert.Equal(t, "hotel-1", hotel.ID)
	assert.Equal(t, "selfserve:v1:hotel:hotel-1", store.lastSetKey)
}

func TestCachedGuestsRepository_FindGuestWithStayHistoryCachesResult(t *testing.T) {
	t.Parallel()

	now := time.Now().UTC()
	repo := &stubGuestsRepo{
		findGuestFn: func(_ context.Context, id string) (*models.Guest, error) {
			return &models.Guest{ID: id}, nil
		},
		findGuestStaysFn: func(_ context.Context, id string) (*models.GuestWithStays, error) {
			return &models.GuestWithStays{
				ID:        id,
				FirstName: "Ada",
				CurrentStays: []models.Stay{
					{ArrivalDate: now, DepartureDate: now.Add(24 * time.Hour), RoomNumber: 404, Status: models.BookingStatusActive},
				},
			}, nil
		},
	}
	store := &fakeKVStore{}

	cached := NewCachedGuestsRepository(NewJSONCache(store), repo, 2*time.Minute, 1*time.Minute)
	result, err := cached.FindGuestWithStayHistory(context.Background(), "guest-1")

	require.NoError(t, err)
	assert.Equal(t, 1, repo.findGuestStaysCalls)
	assert.Equal(t, "selfserve:v1:guest_stays:guest-1", store.lastSetKey)
	assert.Equal(t, 1*time.Minute, store.lastSetTTL)
	assert.Equal(t, "Ada", result.FirstName)
}

func TestCachedGuestBookingsRepository_FindGroupSizeOptionsUsesHotelScopedKey(t *testing.T) {
	t.Parallel()

	repo := &stubGuestBookingsRepo{
		findGroupSizeFn: func(_ context.Context, hotelID string) ([]int, error) {
			return []int{1, 2, 4}, nil
		},
	}
	store := &fakeKVStore{}

	cached := NewCachedGuestBookingsRepository(NewJSONCache(store), repo, 5*time.Minute)
	sizes, err := cached.FindGroupSizeOptions(context.Background(), "hotel-1")

	require.NoError(t, err)
	assert.Equal(t, []int{1, 2, 4}, sizes)
	assert.Equal(t, "selfserve:v1:guest_booking_group_sizes:hotel-1", store.lastSetKey)
}

func TestCachedUsersRepository_FindUserLogsWarnOnCacheReadError(t *testing.T) {
	t.Parallel()

	var logBuffer bytes.Buffer
	logger := slog.New(slog.NewTextHandler(&logBuffer, nil))

	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, id string) (*models.User, error) {
			return &models.User{CreateUser: models.CreateUser{ID: id, FirstName: "Ada"}}, nil
		},
	}
	store := &fakeKVStore{getErr: errors.New("redis unavailable")}

	cached := NewCachedUsersRepository(NewJSONCache(store, logger), repo, 5*time.Minute)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, "Ada", user.FirstName)
	assert.Contains(t, logBuffer.String(), "redis cache read failed")
	assert.Contains(t, logBuffer.String(), "key=selfserve:v1:user:user-1")
	assert.Contains(t, logBuffer.String(), "redis unavailable")
}

func TestCachedUsersRepository_FindUserLogsWarnOnCacheWriteError(t *testing.T) {
	t.Parallel()

	var logBuffer bytes.Buffer
	logger := slog.New(slog.NewTextHandler(&logBuffer, nil))

	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, id string) (*models.User, error) {
			return &models.User{CreateUser: models.CreateUser{ID: id, FirstName: "Ada"}}, nil
		},
	}
	store := &fakeKVStore{setErr: errors.New("redis write unavailable")}

	cached := NewCachedUsersRepository(NewJSONCache(store, logger), repo, 5*time.Minute)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, "Ada", user.FirstName)
	assert.Contains(t, logBuffer.String(), "redis cache write failed")
	assert.Contains(t, logBuffer.String(), "key=selfserve:v1:user:user-1")
	assert.Contains(t, logBuffer.String(), "redis write unavailable")
}
