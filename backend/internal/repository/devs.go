package repository

import (
	"context"

	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DevsRepository struct {
	db *pgxpool.Pool
}

func NewDevsRepository(db *pgxpool.Pool) *DevsRepository {
	return &DevsRepository{db: db}
}

func (r *DevsRepository) GetMember(ctx context.Context, name string) (*models.AllDevsResponse, error) {
	row := r.db.QueryRow(ctx, "SELECT * FROM devs WHERE name = $1 LIMIT 1", name)
	var dev models.Devs
	err := row.Scan(&dev.ID, &dev.CreatedAt, &dev.Member)
	if err != nil {
		return nil, err
	}
	return &models.AllDevsResponse{
		Devs: []models.Devs{dev},
	}, nil
}
