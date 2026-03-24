package redis

import (
	"context"
	"testing"
)

func TestRedisConnection(t *testing.T) {
	client, err := InitRedis()
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
