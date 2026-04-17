package object

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/cache/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeKVStore struct {
	values       map[string]string
	getErr       error
	setErr       error
	deleteErr    error
	lastSetKey   string
	lastSetValue string
	lastSetTTL   time.Duration
	lastDelete   string
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

func (s *fakeKVStore) Set(_ context.Context, key string, value string, ttl time.Duration) error {
	if s.setErr != nil {
		return s.setErr
	}
	if s.values == nil {
		s.values = map[string]string{}
	}
	s.values[key] = value
	s.lastSetKey = key
	s.lastSetValue = value
	s.lastSetTTL = ttl
	return nil
}

func (s *fakeKVStore) Delete(_ context.Context, key string) error {
	if s.deleteErr != nil {
		return s.deleteErr
	}
	s.lastDelete = key
	delete(s.values, key)
	return nil
}

func TestCacheGetReturnsMissWithoutError(t *testing.T) {
	t.Parallel()

	cache := New(&fakeKVStore{})

	var user struct {
		Name string `json:"name"`
	}
	hit, err := cache.Get(context.Background(), "missing", &user)

	require.NoError(t, err)
	assert.False(t, hit)
}

func TestCacheSetStoresJSONValue(t *testing.T) {
	t.Parallel()

	store := &fakeKVStore{}
	cache := New(store)

	err := cache.Set(context.Background(), "users:1", struct {
		Name string `json:"name"`
	}{
		Name: "Ada",
	}, 2*time.Minute)

	require.NoError(t, err)
	assert.Equal(t, "users:1", store.lastSetKey)
	assert.JSONEq(t, `{"name":"Ada"}`, store.lastSetValue)
	assert.Equal(t, 2*time.Minute, store.lastSetTTL)
}

func TestCacheDeleteForwardsToStore(t *testing.T) {
	t.Parallel()

	store := &fakeKVStore{values: map[string]string{"users:1": `{"name":"Ada"}`}}
	cache := New(store)

	err := cache.Delete(context.Background(), "users:1")

	require.NoError(t, err)
	assert.Equal(t, "users:1", store.lastDelete)
}

func TestCacheGetReturnsStoreError(t *testing.T) {
	t.Parallel()

	expected := errors.New("boom")
	cache := New(&fakeKVStore{getErr: expected})

	var user struct{}
	hit, err := cache.Get(context.Background(), "users:1", &user)

	assert.False(t, hit)
	require.ErrorIs(t, err, expected)
}
