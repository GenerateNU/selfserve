package redis

import (
	"testing"
	"time"

	"github.com/generate/selfserve/config"
	"github.com/stretchr/testify/assert"
)

func TestNewOptionsUsesConfigValues(t *testing.T) {
	t.Parallel()

	cfg := config.Redis{
		Enabled:     true,
		Addr:        "cache.internal:6379",
		Password:    "secret",
		DB:          7,
		PingTimeout: 3 * time.Second,
	}

	options := newOptions(cfg)

	assert.Equal(t, "cache.internal:6379", options.Addr)
	assert.Equal(t, "secret", options.Password)
	assert.Equal(t, 7, options.DB)
}
