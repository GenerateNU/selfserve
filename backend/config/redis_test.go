package config

import (
	"context"
	"testing"

	"github.com/sethvargo/go-envconfig"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRedisConfigDefaults(t *testing.T) {
	var cfg Redis
	err := envconfig.Process(context.Background(), &cfg)

	require.NoError(t, err)
	assert.Equal(t, "localhost:6379", cfg.Addr)
	assert.Equal(t, "", cfg.Password)
}
