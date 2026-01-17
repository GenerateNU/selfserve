package repository

import (
	"context"
	"errors"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelRepository struct {
	db *pgxpool.Pool
}

func NewHotelRepository(db *pgxpool.Pool) *HotelRepository {
	return &HotelRepository{db: db}
}

func (r *HotelRepository) GetByID(ctx context.Context, id string) (*models.Hotel, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, name, floors, created_at, updated_at
		FROM hotels 
		WHERE id = $1
	`, id)

	var hotel models.Hotel
	err := row.Scan(&hotel.ID, &hotel.Name, &hotel.Floors, &hotel.CreatedAt, &hotel.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &hotel, nil
}