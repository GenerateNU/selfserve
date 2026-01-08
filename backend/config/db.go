package config

import "fmt"

type DB struct {
	Host     string `env:"DB_HOST, required"`     // db host to connect to
	Port     string `env:"DB_PORT, required"`     // db port to connect to
	User     string `env:"DB_USER, required"`     // db user to connnect with
	Password string `env:"DB_PASSWORD, required"` // db password to connect with
	Name     string `env:"DB_NAME, required"`     // db name to connect to
}

func (db *DB) ConnectionString() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require", db.Host, db.User, db.Password, db.Name, db.Port)
}
