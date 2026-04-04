package service

import (
	"context"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/cache"
	"github.com/generate/selfserve/internal/repository"
)

type noopStore struct{}

func (noopStore) Get(_ context.Context, _ string) (string, error) {
	return "", cache.ErrCacheMiss
}

func (noopStore) Set(_ context.Context, _ string, _ string, _ time.Duration) error {
	return nil
}

func TestBuildUsersRepositoryUsesCacheWhenAvailable(t *testing.T) {
	t.Parallel()

	repo := &repository.UsersRepository{}
	cachedRepo := buildUsersRepository(cache.NewJSONCache(noopStore{}), repo)

	if _, ok := cachedRepo.(*cache.CachedUsersRepository); !ok {
		t.Fatalf("expected cached users repository, got %T", cachedRepo)
	}
}

func TestBuildUsersRepositoryFallsBackWithoutCache(t *testing.T) {
	t.Parallel()

	repo := &repository.UsersRepository{}
	plainRepo := buildUsersRepository(nil, repo)

	if plainRepo != repo {
		t.Fatalf("expected original users repository, got %T", plainRepo)
	}
}

func TestBuildGuestsRepositoryUsesCacheWhenAvailable(t *testing.T) {
	t.Parallel()

	repo := &repository.GuestsRepository{}
	cachedRepo := buildGuestsRepository(cache.NewJSONCache(noopStore{}), repo)

	if _, ok := cachedRepo.(*cache.CachedGuestsRepository); !ok {
		t.Fatalf("expected cached guests repository, got %T", cachedRepo)
	}
}

func TestBuildHotelsRepositoryUsesCacheWhenAvailable(t *testing.T) {
	t.Parallel()

	repo := &repository.HotelsRepository{}
	cachedRepo := buildHotelsRepository(cache.NewJSONCache(noopStore{}), repo)

	if _, ok := cachedRepo.(*cache.CachedHotelsRepository); !ok {
		t.Fatalf("expected cached hotels repository, got %T", cachedRepo)
	}
}

func TestBuildGuestBookingsRepositoryUsesCacheWhenAvailable(t *testing.T) {
	t.Parallel()

	repo := &repository.GuestBookingsRepository{}
	cachedRepo := buildGuestBookingsRepository(cache.NewJSONCache(noopStore{}), repo)

	if _, ok := cachedRepo.(*cache.CachedGuestBookingsRepository); !ok {
		t.Fatalf("expected cached guest bookings repository, got %T", cachedRepo)
	}
}

