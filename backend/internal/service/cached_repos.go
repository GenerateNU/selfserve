package service

import (
	"time"

	"github.com/generate/selfserve/internal/cache"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

func buildUsersRepository(jsonCache *cache.JSONCache, repo *repository.UsersRepository) handler.UsersRepository {
	if jsonCache == nil {
		return repo
	}
	return cache.NewCachedUsersRepository(jsonCache, repo, 5*time.Minute)
}

func buildGuestsRepository(jsonCache *cache.JSONCache, repo *repository.GuestsRepository) storage.GuestsRepository {
	if jsonCache == nil {
		return repo
	}
	return cache.NewCachedGuestsRepository(jsonCache, repo, 2*time.Minute, time.Minute)
}

func buildHotelsRepository(jsonCache *cache.JSONCache, repo *repository.HotelsRepository) handler.HotelsRepository {
	if jsonCache == nil {
		return repo
	}
	return cache.NewCachedHotelsRepository(jsonCache, repo, 15*time.Minute)
}

func buildGuestBookingsRepository(
	jsonCache *cache.JSONCache,
	repo *repository.GuestBookingsRepository,
) handler.GuestBookingsRepository {
	if jsonCache == nil {
		return repo
	}
	return cache.NewCachedGuestBookingsRepository(jsonCache, repo, 5*time.Minute)
}
