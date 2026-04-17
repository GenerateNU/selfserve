package object

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"time"

	"github.com/generate/selfserve/internal/cache/store"
)

type Cache struct {
	store  store.KVStore
	logger *slog.Logger
}

func New(cacheStore store.KVStore, logger ...*slog.Logger) *Cache {
	if cacheStore == nil {
		return nil
	}

	resolvedLogger := slog.Default()
	if len(logger) > 0 && logger[0] != nil {
		resolvedLogger = logger[0]
	}

	return &Cache{store: cacheStore, logger: resolvedLogger}
}

func (c *Cache) Get(ctx context.Context, key string, dest any) (bool, error) {
	value, err := c.store.Get(ctx, key)
	if errors.Is(err, store.ErrCacheMiss) {
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

func (c *Cache) Set(ctx context.Context, key string, value any, ttl time.Duration) error {
	encoded, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.store.Set(ctx, key, string(encoded), ttl)
}

func (c *Cache) Delete(ctx context.Context, key string) error {
	return c.store.Delete(ctx, key)
}

func (c *Cache) WarnReadError(key string, err error) {
	c.warn("redis cache read failed", key, err)
}

func (c *Cache) WarnWriteError(key string, err error) {
	c.warn("redis cache write failed", key, err)
}

func (c *Cache) WarnDeleteError(key string, err error) {
	c.warn("redis cache delete failed", key, err)
}

func (c *Cache) warn(message, key string, err error) {
	if c == nil || err == nil {
		return
	}
	c.logger.Warn(message, "key", key, "err", err)
}
