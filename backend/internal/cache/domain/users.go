package domain

import (
	"context"

	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

type CachedUsersRepository struct {
	cache *object.Cache
	next  storage.UsersRepository
}

func NewCachedUsersRepository(cache *object.Cache, next storage.UsersRepository) *CachedUsersRepository {
	return &CachedUsersRepository{cache: cache, next: next}
}

func (r *CachedUsersRepository) FindUser(ctx context.Context, id string) (*models.User, error) {
	if r.cache == nil {
		return r.next.FindUser(ctx, id)
	}

	key := userKey(id)
	var cached models.User
	if hit, err := r.cache.Get(ctx, key, &cached); err != nil {
		r.cache.WarnReadError(key, err)
	} else if hit {
		return &cached, nil
	}

	user, err := r.next.FindUser(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := r.cache.Set(ctx, key, user, userTTL); err != nil {
		r.cache.WarnWriteError(key, err)
	}
	return user, nil
}

func (r *CachedUsersRepository) InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error) {
	created, err := r.next.InsertUser(ctx, user)
	if err != nil {
		return nil, err
	}
	r.invalidateUser(ctx, created.ID)
	return created, nil
}

func (r *CachedUsersRepository) UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error) {
	updated, err := r.next.UpdateUser(ctx, id, update)
	if err != nil {
		return nil, err
	}
	r.invalidateUser(ctx, id)
	return updated, nil
}

func (r *CachedUsersRepository) UpdateProfilePicture(ctx context.Context, userID string, key string) error {
	if err := r.next.UpdateProfilePicture(ctx, userID, key); err != nil {
		return err
	}
	r.invalidateUser(ctx, userID)
	return nil
}

func (r *CachedUsersRepository) DeleteProfilePicture(ctx context.Context, userID string) error {
	if err := r.next.DeleteProfilePicture(ctx, userID); err != nil {
		return err
	}
	r.invalidateUser(ctx, userID)
	return nil
}

func (r *CachedUsersRepository) GetKey(ctx context.Context, userID string) (string, error) {
	return r.next.GetKey(ctx, userID)
}

func (r *CachedUsersRepository) BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error {
	return r.next.BulkInsertUsers(ctx, users)
}

func (r *CachedUsersRepository) GetUsersByHotel(ctx context.Context, hotelID, cursor string, limit int) ([]*models.User, string, error) {
	return r.next.GetUsersByHotel(ctx, hotelID, cursor, limit)
}

func (r *CachedUsersRepository) SearchUsersByHotel(ctx context.Context, hotelID, cursor, query string, limit int) ([]*models.User, string, error) {
	return r.next.SearchUsersByHotel(ctx, hotelID, cursor, query, limit)
}

func (r *CachedUsersRepository) AddEmployeeDepartment(ctx context.Context, employeeID, departmentID string) error {
	if err := r.next.AddEmployeeDepartment(ctx, employeeID, departmentID); err != nil {
		return err
	}
	r.invalidateUser(ctx, employeeID)
	return nil
}

func (r *CachedUsersRepository) RemoveEmployeeDepartment(ctx context.Context, employeeID, departmentID string) error {
	if err := r.next.RemoveEmployeeDepartment(ctx, employeeID, departmentID); err != nil {
		return err
	}
	r.invalidateUser(ctx, employeeID)
	return nil
}

func (r *CachedUsersRepository) CompleteOnboarding(ctx context.Context, id string, data *models.OnboardUser) (*models.User, error) {
	user, err := r.next.CompleteOnboarding(ctx, id, data)
	if err != nil {
		return nil, err
	}
	r.invalidateUser(ctx, id)
	return user, nil
}

func (r *CachedUsersRepository) invalidateUser(ctx context.Context, id string) {
	if r.cache == nil || id == "" {
		return
	}

	key := userKey(id)
	if err := r.cache.Delete(ctx, key); err != nil {
		r.cache.WarnDeleteError(key, err)
	}
}
