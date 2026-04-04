package redis

import (
	"testing"

	"github.com/generate/selfserve/config"
	"github.com/stretchr/testify/assert"
)

func TestInitRedisUsesConfigValues(t *testing.T) {
	t.Parallel()

	cfg := config.Redis{
		Addr:     "cache.internal:6379",
		Password: "secret",
	}

	options := newOptions(cfg)

	assert.Equal(t, "cache.internal:6379", options.Addr)
	assert.Equal(t, "secret", options.Password)
	assert.Equal(t, 0, options.DB)
}
