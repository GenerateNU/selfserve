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

// func (r *DevsRepository) GetMembers(ctx context.Context) (*models.Dev, error) {

// 	row := r.db.QueryRow(ctx, `
// 	SELECT id, created_at, name
// 	FROM devs
// 	`)

// 	var dev []models.Dev

// 	err := row.Scan(&dev.ID, &dev.CreatedAt, &dev.Name)
// 	if err != nil {
// 		if errors.Is(err, pgx.ErrNoRows) {
// 			return nil, errs.ErrNotFoundInDB
// 		}
// 		return nil, err
// 	}

// 	return &dev, nil
// }

func (r *DevsRepository) PostMember(ctx context.Context, name string) (*models.Dev, error) {

	row := r.db.QueryRow(ctx, `
	INSERT INTO devs (name)
	VALUES ($1)
	`, name)

	var dev models.Dev
	err := row.Scan(&dev.ID, &dev.CreatedAt, &dev.Name)
	if err != nil {

		slog.Error(err.Error())
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &dev, nil
}
