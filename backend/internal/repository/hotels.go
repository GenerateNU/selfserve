package repository

import (
	"context"
	"errors"
	"fmt"
	"iter"

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

const allHotelsWithoutDepartmentsPageSize = 100

// AllHotelsWithoutDepartments returns a paginated iterator over hotels that have
// no departments. Yields one *models.Hotel at a time; the first non-nil error
// stops iteration and is yielded as the second value.
func (r *HotelsRepository) AllHotelsWithoutDepartments(ctx context.Context) iter.Seq2[*models.Hotel, error] {
	return func(yield func(*models.Hotel, error) bool) {
		var cursor string

		for {
			rows, err := r.db.Query(ctx, `
				SELECT h.id, h.name, h.floors, h.created_at, h.updated_at
				FROM hotels h
				LEFT JOIN departments d ON d.hotel_id = h.id
				WHERE d.id IS NULL
				AND ($1::text = '' OR h.id > $1)
				ORDER BY h.id ASC
				LIMIT $2
			`, cursor, allHotelsWithoutDepartmentsPageSize)
			if err != nil {
				yield(nil, err)
				return
			}

			var page []*models.Hotel
			for rows.Next() {
				var h models.Hotel
				if err := rows.Scan(&h.ID, &h.Name, &h.Floors, &h.CreatedAt, &h.UpdatedAt); err != nil {
					rows.Close()
					yield(nil, err)
					return
				}
				page = append(page, &h)
			}
			rows.Close()

			if err := rows.Err(); err != nil {
				yield(nil, err)
				return
			}

			for _, h := range page {
				if !yield(h, nil) {
					return
				}
			}

			if len(page) < allHotelsWithoutDepartmentsPageSize {
				return
			}

			cursor = page[len(page)-1].ID
		}
	}
}

// GetDepartmentsByHotelID returns all departments for a given hotel.
func (r *HotelsRepository) GetDepartmentsByHotelID(ctx context.Context, hotelID string) ([]*models.Department, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, hotel_id, name, created_at, updated_at
		FROM departments
		WHERE hotel_id = $1
		ORDER BY name ASC
	`, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var departments []*models.Department
	for rows.Next() {
		var d models.Department
		if err := rows.Scan(&d.ID, &d.HotelID, &d.Name, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		departments = append(departments, &d)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return departments, nil
}

// InsertDepartment creates a new department for a hotel.
func (r *HotelsRepository) InsertDepartment(ctx context.Context, hotelID, name string) (*models.Department, error) {
	var d models.Department
	err := r.db.QueryRow(ctx, `
		INSERT INTO departments (hotel_id, name)
		VALUES ($1, $2)
		RETURNING id, hotel_id, name, created_at, updated_at
	`, hotelID, name).Scan(&d.ID, &d.HotelID, &d.Name, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrAlreadyExistsInDB
		}
		return nil, err
	}
	return &d, nil
}

// UpdateDepartment renames a department.
func (r *HotelsRepository) UpdateDepartment(ctx context.Context, id, hotelID, name string) (*models.Department, error) {
	var d models.Department
	err := r.db.QueryRow(ctx, `
		UPDATE departments
		SET name = $1, updated_at = NOW()
		WHERE id = $2 AND hotel_id = $3
		RETURNING id, hotel_id, name, created_at, updated_at
	`, name, id, hotelID).Scan(&d.ID, &d.HotelID, &d.Name, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}
	return &d, nil
}

// DeleteDepartment removes a department by id, scoped to the hotel.
func (r *HotelsRepository) DeleteDepartment(ctx context.Context, id, hotelID string) error {
	tag, err := r.db.Exec(ctx, `
		DELETE FROM departments
		WHERE id = $1 AND hotel_id = $2
	`, id, hotelID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errs.ErrNotFoundInDB
	}
	return nil
}

// InsertDefaultDepartments seeds the default departments for a hotel.
// Uses ON CONFLICT DO NOTHING so it is safe to call on hotels that already
// have some (but not all) defaults.
func (r *HotelsRepository) InsertDefaultDepartments(ctx context.Context, hotelID string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO departments (hotel_id, name)
		SELECT $1, unnest($2::text[])
		ON CONFLICT (hotel_id, name) DO NOTHING
	`, hotelID, models.DefaultDepartments)
	if err != nil {
		return fmt.Errorf("%w: %w", errs.ErrDefaultDepartmentInsertDB, err)
	}
	return nil
}
