package config

import (
	"database/sql"
	"fmt"
	"time"
)

type DB struct {
	Host            string `env:"DB_HOST, required"`
	Port            string `env:"DB_PORT, required"`
	User            string `env:"DB_USER, required"`
	Password        string `env:"DB_PASSWORD, required"`
	Name            string `env:"DB_NAME, required"`
	MaxOpenConns    int    `env:"DB_MAX_OPEN_CONNS" envDefault:"50"`         // max connections to keep open (cap on connection pool)
	MaxIdleConns    int    `env:"DB_MAX_IDLE_CONNS" envDefault:"5"`          // max idle connections
	MaxConnIdleTime int    `env:"DB_CONN_MAX_IDLE_TIME" envDefault:"100000"` // max idle time in seconds before closing connection
}
