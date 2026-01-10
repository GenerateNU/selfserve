package repository

import (
	"context"
	"errors"

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

func (r* DevsRepository) GetAllDevs(ctx context.Context) ([]*models.Dev, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, created_at, name
		FROM devs
	`)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	devs, err := pgx.AppendRows[models.Dev, []models.Dev](
		[]models.Dev{}, 
		rows, 
		func (row pgx.Rows) (models.Dev, error) {
			var dev models.Dev
			err := row.Scan(&dev.ID, &dev.CreatedAt, &dev.Name)
			return dev, err
	},
	)

	return devs, nil
}