package storage

import (
	"context"
	"log"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DevsRepository interface {
	GetAllDevs(ctx context.Context) (*[]models.AllDevsResponse, error)
}

type Repository struct {
	DB             *pgxpool.Pool
	DevsRepository DevsRepository
}

// Establishes a sustained connection to the PostgreSQL database / pooling
func ConnectDatabase(ctx context.Context, config config.DB) (*pgxpool.Pool, error) {
	dbConfig, err := pgxpool.ParseConfig(config.ConnectionString())
	if err != nil {
		return nil, err
	}

	// Apply connection pool configuration from config
	dbConfig.MaxConns = config.MaxConns
	dbConfig.MaxConnLifetime = config.MaxConnLifetime

	conn, err := pgxpool.NewWithConfig(ctx, dbConfig)
	if err != nil {
		return nil, err
	}

	err = conn.Ping(ctx)
	if err != nil {
		return nil, err
	}

	log.Printf("Connected to database! MaxConns: %d, MaxConnLifetime: %s", config.MaxConns, config.MaxConnLifetime)

	log.Print("Connected to database!")

	return conn, nil
}

// Closes the pooled connection / cleanup
func (r *Repository) Close() error {
	r.DB.Close()
	return nil
}

func NewRepository(config config.DB) (*Repository, error) {
	db, err := ConnectDatabase(context.Background(), config)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	return &Repository{
		DB: db,
	}, nil
}
