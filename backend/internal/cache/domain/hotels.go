package domain

import (
	"context"

	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

type CachedHotelsRepository struct {
	cache *object.Cache
	next  storage.HotelsRepository
}

func NewCachedHotelsRepository(cache *object.Cache, next storage.HotelsRepository) *CachedHotelsRepository {
	return &CachedHotelsRepository{cache: cache, next: next}
}

func (r *CachedHotelsRepository) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
	if r.cache == nil {
		return r.next.FindByID(ctx, id)
	}

	key := hotelKey(id)
	var cached models.Hotel
	if hit, err := r.cache.Get(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	hotel, err := r.next.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.Set(ctx, key, hotel, hotelTTL); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return hotel, nil
}

func (r *CachedHotelsRepository) InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	return r.next.InsertHotel(ctx, hotel)
}

func (r *CachedHotelsRepository) GetDepartmentsByHotelID(ctx context.Context, hotelID string) ([]*models.Department, error) {
	return r.next.GetDepartmentsByHotelID(ctx, hotelID)
}

func (r *CachedHotelsRepository) InsertDepartment(ctx context.Context, hotelID, name string) (*models.Department, error) {
	return r.next.InsertDepartment(ctx, hotelID, name)
}

func (r *CachedHotelsRepository) UpdateDepartment(ctx context.Context, id, hotelID, name string) (*models.Department, error) {
	return r.next.UpdateDepartment(ctx, id, hotelID, name)
}

func (r *CachedHotelsRepository) DeleteDepartment(ctx context.Context, id, hotelID string) error {
	return r.next.DeleteDepartment(ctx, id, hotelID)
}
