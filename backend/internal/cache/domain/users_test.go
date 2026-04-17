package domain

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/cache/object"
	"github.com/generate/selfserve/internal/cache/store"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeKVStore struct {
	values      map[string]string
	getErr      error
	setErr      error
	deleteErr   error
	lastSetKey  string
	lastDeleted string
}

func (s *fakeKVStore) Get(_ context.Context, key string) (string, error) {
	if s.getErr != nil {
		return "", s.getErr
	}
	value, ok := s.values[key]
	if !ok {
		return "", store.ErrCacheMiss
	}
	return value, nil
}

func (s *fakeKVStore) Set(_ context.Context, key string, value string, _ time.Duration) error {
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

func (s *fakeKVStore) Delete(_ context.Context, key string) error {
	if s.deleteErr != nil {
		return s.deleteErr
	}
	s.lastDeleted = key
	delete(s.values, key)
	return nil
}

type stubUsersRepo struct {
	findUserCalls int
	findUserFn    func(ctx context.Context, id string) (*models.User, error)
	updateUserFn  func(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error)
	updatePicFn   func(ctx context.Context, userID, key string) error
}

func (s *stubUsersRepo) FindUser(ctx context.Context, id string) (*models.User, error) {
	s.findUserCalls++
	return s.findUserFn(ctx, id)
}

func (s *stubUsersRepo) InsertUser(_ context.Context, user *models.CreateUser) (*models.User, error) {
	return &models.User{CreateUser: *user}, nil
}

func (s *stubUsersRepo) UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error) {
	return s.updateUserFn(ctx, id, update)
}

func (s *stubUsersRepo) UpdateProfilePicture(ctx context.Context, userID string, key string) error {
	return s.updatePicFn(ctx, userID, key)
}

func (s *stubUsersRepo) DeleteProfilePicture(_ context.Context, _ string) error { return nil }
func (s *stubUsersRepo) GetKey(_ context.Context, _ string) (string, error)     { return "", nil }
func (s *stubUsersRepo) BulkInsertUsers(_ context.Context, _ []*models.CreateUser) error {
	return nil
}
func (s *stubUsersRepo) GetUsersByHotel(_ context.Context, _, _ string, _ int) ([]*models.User, string, error) {
	return nil, "", nil
}
func (s *stubUsersRepo) SearchUsersByHotel(_ context.Context, _, _, _ string, _ int) ([]*models.User, string, error) {
	return nil, "", nil
}
func (s *stubUsersRepo) AddEmployeeDepartment(_ context.Context, _, _ string) error { return nil }
func (s *stubUsersRepo) RemoveEmployeeDepartment(_ context.Context, _, _ string) error {
	return nil
}
func (s *stubUsersRepo) CompleteOnboarding(_ context.Context, _ string, _ *models.OnboardUser) (*models.User, error) {
	return nil, nil
}

var _ storage.UsersRepository = (*stubUsersRepo)(nil)

func TestUserKeyIsDeterministic(t *testing.T) {
	t.Parallel()

	assert.Equal(t, "selfserve:v1:users:user-1", userKey("user-1"))
}

func TestCachedUsersRepositoryFindUserUsesCacheHit(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeKVStore{
		values: map[string]string{
			userKey("user-1"): `{"id":"user-1","first_name":"Ada"}`,
		},
	}
	repo := &stubUsersRepo{
		findUserFn: func(context.Context, string) (*models.User, error) {
			t.Fatal("repo should not be called on cache hit")
			return nil, nil
		},
	}

	cached := NewCachedUsersRepository(object.New(cacheStore), repo)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, "Ada", user.FirstName)
	assert.Equal(t, 0, repo.findUserCalls)
}

func TestCachedUsersRepositoryFindUserCachesRepositoryResult(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeKVStore{}
	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, id string) (*models.User, error) {
			return &models.User{CreateUser: models.CreateUser{ID: id, FirstName: "Ada"}}, nil
		},
	}

	cached := NewCachedUsersRepository(object.New(cacheStore), repo)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, "Ada", user.FirstName)
	assert.Equal(t, userKey("user-1"), cacheStore.lastSetKey)
}

func TestCachedUsersRepositoryFindUserFailsOpenOnCacheReadError(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeKVStore{getErr: errors.New("redis unavailable")}
	repo := &stubUsersRepo{
		findUserFn: func(_ context.Context, id string) (*models.User, error) {
			return &models.User{CreateUser: models.CreateUser{ID: id, FirstName: "Ada"}}, nil
		},
	}

	cached := NewCachedUsersRepository(object.New(cacheStore), repo)
	user, err := cached.FindUser(context.Background(), "user-1")

	require.NoError(t, err)
	assert.Equal(t, "Ada", user.FirstName)
	assert.Equal(t, 1, repo.findUserCalls)
}

func TestCachedUsersRepositoryUpdateUserInvalidatesOnSuccess(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeKVStore{values: map[string]string{userKey("user-1"): `{"id":"user-1"}`}}
	repo := &stubUsersRepo{
		findUserFn: func(context.Context, string) (*models.User, error) { return nil, nil },
		updateUserFn: func(_ context.Context, id string, update *models.UpdateUser) (*models.User, error) {
			return &models.User{CreateUser: models.CreateUser{ID: id, PhoneNumber: update.PhoneNumber}}, nil
		},
		updatePicFn: func(context.Context, string, string) error { return nil },
	}

	cached := NewCachedUsersRepository(object.New(cacheStore), repo)
	_, err := cached.UpdateUser(context.Background(), "user-1", &models.UpdateUser{PhoneNumber: stringPtr("123")})

	require.NoError(t, err)
	assert.Equal(t, userKey("user-1"), cacheStore.lastDeleted)
}

func TestCachedUsersRepositoryUpdateProfilePictureInvalidatesOnSuccess(t *testing.T) {
	t.Parallel()

	cacheStore := &fakeKVStore{values: map[string]string{userKey("user-1"): `{"id":"user-1"}`}}
	repo := &stubUsersRepo{
		findUserFn: func(context.Context, string) (*models.User, error) { return nil, nil },
		updateUserFn: func(context.Context, string, *models.UpdateUser) (*models.User, error) {
			return nil, nil
		},
		updatePicFn: func(context.Context, string, string) error { return nil },
	}

	cached := NewCachedUsersRepository(object.New(cacheStore), repo)
	err := cached.UpdateProfilePicture(context.Background(), "user-1", "profile-key")

	require.NoError(t, err)
	assert.Equal(t, userKey("user-1"), cacheStore.lastDeleted)
}

func stringPtr(value string) *string {
	return &value
}
