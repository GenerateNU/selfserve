package config

import (
	"fmt"
	"time"
)

type DB struct {
	Host              string        `env:"HOST, required"`                   // db host to connect to
	Port              string        `env:"PORT, required"`                   // db port to connect to
	User              string        `env:"USER, required"`                   // db user to connect with
	Password          string        `env:"PASSWORD, required"`               // db password to connect with
	Name              string        `env:"NAME, required"`                   // db name to connect to
	SSLMode           string        `env:"SSLMODE, default=disable"`         // sslmode for connection (disable for local, require for production)
	MaxConns          int32         `env:"MAX_CONNS, default=8"`             // max number of connections to the database
	MinConns          int32         `env:"MIN_CONNS, default=2"`             // min number of idle connections to keep open
	MaxConnLifetime   time.Duration `env:"MAX_CONN_LIFETIME, default=30s"`   // max lifetime of a connection before automatically closing
	MaxConnIdleTime   time.Duration `env:"MAX_CONN_IDLE_TIME, default=15s"`  // max time a connection can be idle before closing
	HealthCheckPeriod time.Duration `env:"HEALTH_CHECK_PERIOD, default=30s"` // how often to health-check idle connections

}

func (db *DB) ConnectionString() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s", db.Host, db.User, db.Password, db.Name, db.Port, db.SSLMode)
}
