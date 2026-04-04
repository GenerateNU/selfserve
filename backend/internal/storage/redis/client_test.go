package redis

import (
	"context"
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

func TestRedisConnection(t *testing.T) {
	client, err := InitRedis(config.Redis{Addr: "localhost:6379"})
	if err != nil {
		t.Skipf("Skipping test: Redis not available: %v", err)
	}
	defer func() {
		_ = Close(client)
	}()

	ctx := context.Background()

	// Test Set
	err = client.Set(ctx, "test_key", "test_value", 0).Err()
	if err != nil {
		t.Fatalf("Failed to set value: %v", err)
	}
	defer client.Del(ctx, "test_key")

	// Test Get
	val, err := client.Get(ctx, "test_key").Result()
	if err != nil {
		t.Fatalf("Failed to get value: %v", err)
	}
	if val != "test_value" {
		t.Errorf("Expected 'test_value', got '%s'", val)
	}
}
