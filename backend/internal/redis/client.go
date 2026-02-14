package redis

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

// Client is the global Redis client that the whole app uses
var Client *redis.Client

// InitRedis initializes the Redis connection
func InitRedis() error {
	// Create a new Redis client with configuration
	Client = redis.NewClient(&redis.Options{
		Addr:     getRedisAddr(),     // Where is Redis? (localhost:6379)
		Password: getRedisPassword(), // Password (empty for local dev)
		DB:       0,                  // Redis has 16 databases (0-15), we use 0
	})

	// Test the connection by sending a PING command
	ctx := context.Background()
	if err := Client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	// Success!
	fmt.Println("✓ Connected to Redis")
	return nil
}

// getRedisAddr reads REDIS_ADDR from environment, defaults to localhost:6379
func getRedisAddr() string {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		return "localhost:6379" // Default for local development
	}
	return addr
}

// getRedisPassword reads REDIS_PASSWORD from environment
func getRedisPassword() string {
	return os.Getenv("REDIS_PASSWORD") // Empty string is fine
}

// Close closes the Redis connection (called when app shuts down)
func Close() error {
	if Client != nil {
		return Client.Close()
	}
	return nil
}
