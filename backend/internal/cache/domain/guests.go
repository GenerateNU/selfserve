package domain

import (
	"context"

	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

type CachedGuestsRepository struct {
	cache *object.Cache
	next  storage.GuestsRepository
}

func NewCachedGuestsRepository(cache *object.Cache, next storage.GuestsRepository) *CachedGuestsRepository {
	return &CachedGuestsRepository{cache: cache, next: next}
}

func (r *CachedGuestsRepository) InsertGuest(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
	created, err := r.next.InsertGuest(ctx, guest)
	if err != nil {
		return nil, err
	}
	r.invalidateGuest(ctx, created.ID)
	return created, nil
}

func (r *CachedGuestsRepository) FindGuest(ctx context.Context, id string) (*models.Guest, error) {
	if r.cache == nil {
		return r.next.FindGuest(ctx, id)
	}

	key := guestKey(id)
	var cached models.Guest
	if hit, err := r.cache.Get(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	guest, err := r.next.FindGuest(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.Set(ctx, key, guest, guestTTL); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return guest, nil
}

func (r *CachedGuestsRepository) UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
	updated, err := r.next.UpdateGuest(ctx, id, update)
	if err != nil {
		return nil, err
	}
	r.invalidateGuest(ctx, id)
	return updated, nil
}

func (r *CachedGuestsRepository) FindGuestsWithActiveBooking(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error) {
	return r.next.FindGuestsWithActiveBooking(ctx, filters)
}

func (r *CachedGuestsRepository) FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error) {
	if r.cache == nil {
		return r.next.FindGuestWithStayHistory(ctx, id)
	}

	key := guestStayHistoryKey(id)
	var cached models.GuestWithStays
	if hit, err := r.cache.Get(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	guest, err := r.next.FindGuestWithStayHistory(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.Set(ctx, key, guest, guestStayHistoryTTL); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return guest, nil
}

func (r *CachedGuestsRepository) invalidateGuest(ctx context.Context, id string) {
	if r.cache == nil || id == "" {
		return
	}

	for _, key := range []string{guestKey(id), guestStayHistoryKey(id)} {
		if err := r.cache.Delete(ctx, key); err != nil {
			r.cache.WarnDeleteError(key, err)
		}
	}
}
