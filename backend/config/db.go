package config

import (
	"fmt"
	"time"
)

type DB struct {
	Host            string        `env:"DB_HOST, required"`                 // db host to connect to
	Port            string        `env:"DB_PORT, required"`                 // db port to connect to
	User            string        `env:"DB_USER, required"`                 // db user to connect with
	Password        string        `env:"DB_PASSWORD, required"`             // db password to connect with
	Name            string        `env:"DB_NAME, required"`                 // db name to connect to
	MaxConns        int32         `env:"DB_MAX_CONNS, default=8"`           // max number of connections to the database
	MaxConnLifetime time.Duration `env:"DB_MAX_CONN_LIFETIME, default=30s"` // max lifetime of a connection before automatically closing

}

func (db *DB) ConnectionString() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require", db.Host, db.User, db.Password, db.Name, db.Port)
}
