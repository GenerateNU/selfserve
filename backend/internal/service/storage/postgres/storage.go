package storage

import (
	"context"
	"fmt"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/repository"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DevsRepository interface {
	GetMember(ctx context.Context, name string) (*models.Dev, error)
}

type Repository struct {
	DB                *pgxpool.Pool
	DevsRepository    DevsRepository
	UsersRepository   UsersRepository
	GuestsRepository  GuestsRepository
	RequestRepository RequestsRepository
	HotelRepository   HotelRepository
	HotelsRepository  HotelsRepository
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
		// TODO: error handling
		return nil, fmt.Errorf("connecting to database: %w", err)
	}

	return &Repository{
		DB:                db,
		DevsRepository:    repository.NewDevsRepository(db),
		UsersRepository:   repository.NewUsersRepository(db),
		GuestsRepository:  repository.NewGuestsRepository(db),
		RequestRepository: repository.NewRequestsRepo(db),
		HotelRepository:   repository.NewHotelRepository(db),
		HotelsRepository:  repository.NewHotelsRepo(db),
	}, nil
}
