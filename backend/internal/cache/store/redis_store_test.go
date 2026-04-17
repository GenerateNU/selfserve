package store

import (
	"context"
	"errors"
	"testing"

	goredis "github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRedisStoreGetTranslatesRedisNil(t *testing.T) {
	t.Parallel()

	cache := &RedisStore{
		getValue: func(context.Context, string) (string, error) {
			return "", goredis.Nil
		},
	}

	value, err := cache.Get(context.Background(), "missing")

	assert.Empty(t, value)
	require.ErrorIs(t, err, ErrCacheMiss)
}

func TestRedisStoreDeleteForwardsErrors(t *testing.T) {
	t.Parallel()

	expected := errors.New("boom")
	cache := &RedisStore{
		deleteValue: func(context.Context, string) error {
			return expected
		},
	}

	err := cache.Delete(context.Background(), "users:1")

	require.ErrorIs(t, err, expected)
}
