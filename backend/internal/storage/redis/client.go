package redis

import (
	"context"
	"fmt"

	"github.com/generate/selfserve/config"
	"github.com/redis/go-redis/v9"
)

// InitRedis initializes and returns a Redis client
func InitRedis(cfg config.Redis) (*redis.Client, error) {
	client := redis.NewClient(newOptions(cfg))

	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return client, nil
}

// Close closes the Redis connection
func Close(client *redis.Client) error {
	if client != nil {
		return client.Close()
	}
	return nil
}

func newOptions(cfg config.Redis) *redis.Options {
	return &redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       0,
	}
}
