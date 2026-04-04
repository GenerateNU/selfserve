package cache

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeKVStore struct {
	values       map[string]string
	getErr       error
	setErr       error
	lastSetKey   string
	lastSetValue string
	lastSetTTL   time.Duration
}

func (s *fakeKVStore) Get(_ context.Context, key string) (string, error) {
	if s.getErr != nil {
		return "", s.getErr
	}
	value, ok := s.values[key]
	if !ok {
		return "", ErrCacheMiss
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

func TestJSONCache_GetJSONReturnsCachedValue(t *testing.T) {
	t.Parallel()

	store := &fakeKVStore{
		values: map[string]string{
			"user:1": `{"name":"Ada","count":3}`,
		},
	}
	cache := NewJSONCache(store)

	var dest struct {
		Name  string `json:"name"`
		Count int    `json:"count"`
	}
	hit, err := cache.GetJSON(context.Background(), "user:1", &dest)

	require.NoError(t, err)
	assert.True(t, hit)
	assert.Equal(t, "Ada", dest.Name)
	assert.Equal(t, 3, dest.Count)
}

func TestJSONCache_GetJSONReturnsMissForMissingKey(t *testing.T) {
	t.Parallel()

	cache := NewJSONCache(&fakeKVStore{})

	var dest struct {
		Name string `json:"name"`
	}
	hit, err := cache.GetJSON(context.Background(), "missing", &dest)

	require.NoError(t, err)
	assert.False(t, hit)
	assert.Equal(t, "", dest.Name)
}

func TestJSONCache_SetJSONStoresSerializedValue(t *testing.T) {
	t.Parallel()

	store := &fakeKVStore{}
	cache := NewJSONCache(store)

	value := struct {
		Name  string `json:"name"`
		Count int    `json:"count"`
	}{
		Name:  "Ada",
		Count: 3,
	}

	err := cache.SetJSON(context.Background(), "user:1", value, 2*time.Minute)

	require.NoError(t, err)
	assert.Equal(t, "user:1", store.lastSetKey)
	assert.JSONEq(t, `{"name":"Ada","count":3}`, store.lastSetValue)
	assert.Equal(t, 2*time.Minute, store.lastSetTTL)
}

func TestJSONCache_GetJSONReturnsStoreError(t *testing.T) {
	t.Parallel()

	expectedErr := errors.New("boom")
	cache := NewJSONCache(&fakeKVStore{getErr: expectedErr})

	var dest struct{}
	hit, err := cache.GetJSON(context.Background(), "user:1", &dest)

	assert.False(t, hit)
	require.ErrorIs(t, err, expectedErr)
}

