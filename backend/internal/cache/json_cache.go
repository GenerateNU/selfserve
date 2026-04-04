package cache

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

var ErrCacheMiss = errors.New("cache miss")

type KVStore interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value string, ttl time.Duration) error
}

type JSONCache struct {
	store KVStore
}

type RedisStore struct {
	client *goredis.Client
}

func NewJSONCache(store KVStore) *JSONCache {
	if store == nil {
		return nil
	}
	return &JSONCache{store: store}
}

func NewRedisStore(client *goredis.Client) *RedisStore {
	if client == nil {
		return nil
	}
	return &RedisStore{client: client}
}

func (s *RedisStore) Get(ctx context.Context, key string) (string, error) {
	value, err := s.client.Get(ctx, key).Result()
	if errors.Is(err, goredis.Nil) {
		return "", ErrCacheMiss
	}
	if err != nil {
		return "", err
	}
	return value, nil
}

func (s *RedisStore) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	return s.client.Set(ctx, key, value, ttl).Err()
}

func (c *JSONCache) GetJSON(ctx context.Context, key string, dest any) (bool, error) {
	value, err := c.store.Get(ctx, key)
	if errors.Is(err, ErrCacheMiss) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal([]byte(value), dest); err != nil {
		return false, err
	}
	return true, nil
}

func (c *JSONCache) SetJSON(ctx context.Context, key string, value any, ttl time.Duration) error {
	encoded, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.store.Set(ctx, key, string(encoded), ttl)
}

