package repository

import (
	"context"

	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelsRepository struct {
	db *pgxpool.Pool
}

func NewHotelsRepo(db *pgxpool.Pool) *HotelsRepository {
	return &HotelsRepository{db: db}
}

func (r *HotelsRepository) InsertHotel(ctx context.Context, hotel *models.Hotel) (*models.Hotel, error) {
	err := r.db.QueryRow(ctx, `INSERT INTO hotels (
		name, floors
	) VALUES ($1, $2)
		RETURNING id, created_at, updated_at
	`, hotel.Name, hotel.Floors).Scan(&hotel.ID, &hotel.CreatedAt, &hotel.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return hotel, nil
}
