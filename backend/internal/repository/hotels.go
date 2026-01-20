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

func (r *HotelsRepository) InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	createdHotel := &models.Hotel{CreateHotelRequest: *hotel}

	err := r.db.QueryRow(ctx, `
		INSERT INTO hotels (
			name, floors
		) VALUES (
			$1, $2
		)
		RETURNING id, created_at, updated_at
	`,
		hotel.Name,
		hotel.Floors,
	).Scan(&createdHotel.ID, &createdHotel.CreatedAt, &createdHotel.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return createdHotel, nil
}
