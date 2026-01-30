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

func (r *HotelRepository) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
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
