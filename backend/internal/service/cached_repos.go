package service

import (
	"github.com/generate/selfserve/internal/cache/domain"
	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

func buildUsersRepository(cache *object.Cache, repo *repository.UsersRepository) storage.UsersRepository {
	if cache == nil {
		return repo
	}
	return domain.NewCachedUsersRepository(cache, repo)
}

func buildGuestsRepository(cache *object.Cache, repo *repository.GuestsRepository) storage.GuestsRepository {
	if cache == nil {
		return repo
	}
	return domain.NewCachedGuestsRepository(cache, repo)
}

func buildHotelsRepository(cache *object.Cache, repo *repository.HotelsRepository) handler.HotelsRepository {
	if cache == nil {
		return repo
	}
	return domain.NewCachedHotelsRepository(cache, repo)
}

func buildGuestBookingsRepository(cache *object.Cache, repo *repository.GuestBookingsRepository) handler.GuestBookingsRepository {
	if cache == nil {
		return repo
	}
	return domain.NewCachedGuestBookingsRepository(cache, repo)
}
