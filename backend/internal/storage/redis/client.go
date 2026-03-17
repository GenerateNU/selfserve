package redis

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

// InitRedis initializes and returns a Redis client
func InitRedis() (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     getRedisAddr(),
		Password: getRedisPassword(),
		DB:       0,
	})

	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	fmt.Println("✓ Connected to Redis")
	return client, nil
}

// Close closes the Redis connection
func Close(client *redis.Client) error {
	if client != nil {
		return client.Close()
	}
	return nil
}

func getRedisAddr() string {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		return "localhost:6379"
	}
	return addr
}

func getRedisPassword() string {
	return os.Getenv("REDIS_PASSWORD")
}