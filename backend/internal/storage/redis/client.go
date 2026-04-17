package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/generate/selfserve/config"
	"github.com/redis/go-redis/v9"
)

// InitRedis initializes and returns a Redis client
func InitRedis(cfg config.Redis) (*redis.Client, error) {
	client := redis.NewClient(newOptions(cfg))

	ctx, cancel := context.WithTimeout(context.Background(), pingTimeout(cfg))
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
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
		DB:       cfg.DB,
	}
}

func pingTimeout(cfg config.Redis) time.Duration {
	if cfg.PingTimeout <= 0 {
		return time.Second
	}
	return cfg.PingTimeout
}
