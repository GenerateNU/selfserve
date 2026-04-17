package service

import (
	"errors"
	"testing"

	"github.com/generate/selfserve/config"
	"github.com/stretchr/testify/assert"
)

func TestTryInitRedisReturnsNilWhenDisabled(t *testing.T) {
	t.Parallel()

	client := tryInitRedis(config.Redis{})

	assert.Nil(t, client)
}

func TestTryInitRedisReturnsNilOnInitError(t *testing.T) {
	t.Parallel()

	original := initRedisClient
	initRedisClient = func(config.Redis) (redisClient, error) {
		return nil, errors.New("boom")
	}
	t.Cleanup(func() {
		initRedisClient = original
	})

	client := tryInitRedis(config.Redis{Enabled: true, Addr: "cache.internal:6379"})

	assert.Nil(t, client)
}
