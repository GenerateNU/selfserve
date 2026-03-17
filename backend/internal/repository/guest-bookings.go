package repository

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type GuestBookingsRepository struct {
	db *pgxpool.Pool
}

func NewGuestBookingsRepository(db *pgxpool.Pool) *GuestBookingsRepository {
	return &GuestBookingsRepository{db: db}
}
