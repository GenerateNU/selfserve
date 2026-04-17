package service

import (
	"github.com/generate/selfserve/internal/cache/domain"
	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

func buildUsersRepository(cache *object.Cache, repo *repository.UsersRepository) storage.UsersRepository {
	if cache == nil {
		return repo
	}
	return domain.NewCachedUsersRepository(cache, repo)
}
