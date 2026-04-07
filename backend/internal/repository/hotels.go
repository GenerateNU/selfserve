package repository

import (
	"context"
	"errors"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HotelsRepository struct {
	db *pgxpool.Pool
}

func NewHotelsRepository(db *pgxpool.Pool) *HotelsRepository {
	return &HotelsRepository{db: db}
}

func (r *HotelsRepository) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
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

func (r *HotelsRepository) InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	createdHotel := &models.Hotel{CreateHotelRequest: *hotel}
	err := r.db.QueryRow(ctx, `
        INSERT INTO hotels (id, name, floors)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
        RETURNING created_at, updated_at
    `, hotel.ID, hotel.Name, hotel.Floors).Scan(
		&createdHotel.CreatedAt, &createdHotel.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrAlreadyExistsInDB
		}
		return nil, err
	}
	return createdHotel, nil
}
