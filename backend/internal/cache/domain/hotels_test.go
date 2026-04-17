package domain

import (
	"context"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/cache/store"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeDomainStore struct {
	values      map[string]string
	getErr      error
	setErr      error
	deleteErr   error
	lastSetKey  string
	lastDeleted string
}

func (s *fakeDomainStore) Get(_ context.Context, key string) (string, error) {
	if s.getErr != nil {
		return "", s.getErr
	}
	value, ok := s.values[key]
	if !ok {
		return "", store.ErrCacheMiss
	}
	return value, nil
}

func (s *fakeDomainStore) Set(_ context.Context, key string, value string, _ time.Duration) error {
	if s.setErr != nil {
		return s.setErr
	}
	if s.values == nil {
		s.values = map[string]string{}
	}
	s.values[key] = value
	s.lastSetKey = key
	return nil
}

func (s *fakeDomainStore) Delete(_ context.Context, key string) error {
	if s.deleteErr != nil {
		return s.deleteErr
	}
	s.lastDeleted = key
	delete(s.values, key)
	return nil
}

type stubHotelsRepo struct {
	findByIDFn func(ctx context.Context, id string) (*models.Hotel, error)
}

func (s *stubHotelsRepo) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
	return s.findByIDFn(ctx, id)
}
func (s *stubHotelsRepo) InsertHotel(_ context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	return &models.Hotel{CreateHotelRequest: *hotel}, nil
}
func (s *stubHotelsRepo) GetDepartmentsByHotelID(_ context.Context, _ string) ([]*models.Department, error) {
	return nil, nil
}
func (s *stubHotelsRepo) InsertDepartment(_ context.Context, _, _ string) (*models.Department, error) {
	return nil, nil
}
func (s *stubHotelsRepo) UpdateDepartment(_ context.Context, _, _, _ string) (*models.Department, error) {
	return nil, nil
}
func (s *stubHotelsRepo) DeleteDepartment(_ context.Context, _, _ string) error { return nil }

var _ storage.HotelsRepository = (*stubHotelsRepo)(nil)

func TestCachedHotelsRepositoryCachesFindByID(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeDomainStore{}
	repo := &stubHotelsRepo{
		findByIDFn: func(_ context.Context, id string) (*models.Hotel, error) {
			return &models.Hotel{CreateHotelRequest: models.CreateHotelRequest{ID: id, Name: "Hotel One"}}, nil
		},
	}

	cached := NewCachedHotelsRepository(object.New(cacheStore), repo)
	hotel, err := cached.FindByID(context.Background(), "hotel-1")

	require.NoError(t, err)
	assert.Equal(t, "Hotel One", hotel.Name)
	assert.Equal(t, hotelKey("hotel-1"), cacheStore.lastSetKey)
}
