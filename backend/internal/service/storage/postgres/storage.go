package storage

import (
	"context"
	"log"

	"github.com/generate/selfserve/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

// Closes the pooled connection / cleanup
func (r *Repository) Close() error {
	r.DB.Close()
	return nil
}

// Establishes a sustained connection to the PostgreSQL database / pooling
func ConnectDatabase(ctx context.Context, config config.DB) (*pgxpool.Pool, error) {
	dbConfig, err := pgxpool.ParseConfig(config.ConnectionString())
	if err != nil {
		return nil, err
	}

	conn, err := pgxpool.NewWithConfig(ctx, dbConfig)
	if err != nil {
		return nil, err
	}

	err = conn.Ping(ctx)
	if err != nil {
		return nil, err
	}

	log.Print("Connected to database!")

	return conn, nil
}

func NewRepository(config config.DB) *Repository {
	// db := ConnectDatabase(config)

	return &Repository{
		// DB: db,
		DB: nil,
	}
}
