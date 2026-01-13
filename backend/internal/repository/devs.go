package repository

import (
	"context"
	"errors"
	"log/slog"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DevsRepository struct {
	db *pgxpool.Pool
}

func NewDevsRepository(db *pgxpool.Pool) *DevsRepository {
	return &DevsRepository{db: db}
}

func (r *DevsRepository) GetMember(ctx context.Context, name string) (*models.Dev, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, created_at, name
		FROM devs 
		WHERE name = $1
	`, name)

	var dev models.Dev
	err := row.Scan(&dev.ID, &dev.CreatedAt, &dev.Name)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &dev, nil
}

// GetMembers (Corrected to return a single member based on your return type)
func (r *DevsRepository) GetMembers(ctx context.Context) ([]models.Dev, error) {
	// 1. Execute the query
	rows, err := r.db.Query(ctx, `
		SELECT id, created_at, name
		FROM devs
	`)
	if err != nil {
		return nil, err
	}
	// Always close rows to prevent connection leaks
	defer rows.Close()

	var devs []models.Dev

	// 2. Iterate through the result set
	for rows.Next() {
		var dev models.Dev
		err := rows.Scan(&dev.ID, &dev.CreatedAt, &dev.Name)
		if err != nil {
			return nil, err
		}
		devs = append(devs, dev)
	}

	// 3. Check for errors that occurred during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return devs, nil
}

// PostMember (Corrected logic and syntax)
func (r *DevsRepository) PostMember(ctx context.Context, name string) (*models.Dev, error) {
	var dev models.Dev

	// 1. Corrected "RETURNING" typo
	// 2. We must call .Scan() immediately to capture the data and the error
	err := r.db.QueryRow(ctx, `
        INSERT INTO devs (name)
        VALUES ($1)
        RETURNING id, created_at, name
    `, name).Scan(&dev.ID, &dev.CreatedAt, &dev.Name)

	if err != nil {
		// Log the actual error for debugging
		slog.Error("failed to insert member", "error", err)

		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &dev, nil
}
