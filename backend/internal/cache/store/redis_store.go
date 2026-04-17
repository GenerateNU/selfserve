package store

import (
	"context"
	"errors"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

type RedisStore struct {
	getValue    func(ctx context.Context, key string) (string, error)
	setValue    func(ctx context.Context, key string, value string, ttl time.Duration) error
	deleteValue func(ctx context.Context, key string) error
}

func NewRedisStore(client *goredis.Client) *RedisStore {
	if client == nil {
		return nil
	}

	return &RedisStore{
		getValue: func(ctx context.Context, key string) (string, error) {
			return client.Get(ctx, key).Result()
		},
		setValue: func(ctx context.Context, key string, value string, ttl time.Duration) error {
			return client.Set(ctx, key, value, ttl).Err()
		},
		deleteValue: func(ctx context.Context, key string) error {
			return client.Del(ctx, key).Err()
		},
	}
}

func (s *RedisStore) Get(ctx context.Context, key string) (string, error) {
	value, err := s.getValue(ctx, key)
	if errors.Is(err, goredis.Nil) {
		return "", ErrCacheMiss
	}
	if err != nil {
		return "", err
	}
	return value, nil
}

func (s *RedisStore) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	return s.setValue(ctx, key, value, ttl)
}

func (s *RedisStore) Delete(ctx context.Context, key string) error {
	return s.deleteValue(ctx, key)
}
