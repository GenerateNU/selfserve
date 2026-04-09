package repository

import (
	"context"
	"errors"
	"fmt"

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
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	createdHotel := &models.Hotel{CreateHotelRequest: *hotel}
	err = tx.QueryRow(ctx, `
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

	_, err = tx.Exec(ctx, `
		INSERT INTO departments (hotel_id, name)
		SELECT $1, unnest($2::text[])
	`, hotel.ID, models.DefaultDepartments)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", errs.ErrDefaultDepartmentInsertDB, err)
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	return createdHotel, nil
}
