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

func (r *DevsRepository) GetAll(ctx context.Context) (*[]models.AllDevsResponse, error) {
	rows, err := r.db.Query(ctx, "SELECT * FROM devs")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devs []models.AllDevsResponse
	for rows.Next() {
		var dev models.Devs
		err = rows.Scan(&dev.ID, &dev.CreatedAt, &dev.Member)
		if err != nil {
			return nil, err
		}
		devs = append(devs, models.AllDevsResponse{Devs: []models.Devs{dev}})
	}
	return &devs, nil
}
