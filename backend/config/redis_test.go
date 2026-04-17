package config

import (
	"context"
	"testing"
	"time"

	"github.com/sethvargo/go-envconfig"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRedisConfigDefaults(t *testing.T) {
	t.Parallel()

	var cfg Redis
	err := envconfig.Process(context.Background(), &cfg)

	require.NoError(t, err)
	assert.False(t, cfg.Enabled)
	assert.Equal(t, "localhost:6379", cfg.Addr)
	assert.Equal(t, "", cfg.Password)
	assert.Equal(t, 0, cfg.DB)
	assert.Equal(t, time.Second, cfg.PingTimeout)
}
