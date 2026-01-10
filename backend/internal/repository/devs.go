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

func (r *DevsRepository) MakeDev(ctx context.Context, name string) (int64, error) {
	var id int64
	result, err := r.db.Exec(ctx, `
	INSERT INTO devs (name) VALUES (?)
	RETURNING id`,
	name)
	
	if err != nil {
		if errors.Is(err, errs.ErrAlreadyExistsInDB){
			return 0, err
		}
	}
	id, err := result.LastInsertId()
	if err != nil {
        return 0, err
    }
	return id
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

func (r *DevsRepository) GetDevs(ctx context.Context) ([]*models.Dev, error) {
	rows, err := r.db.Query(ctx, `
        SELECT id, created_at, name
        FROM devs
    `)

	if err != nil {
        return nil, err
    }
    defer rows.Close()

	var devs []*models.Dev
	for rows.Next(){
		var d models.Dev
		if err := rows.Scan(&d.ID, &d.CreatedAt, &d.Name); err != nil {
			return nil, err
		}
		devs = append(devs, &d)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(devs) == 0 {
		return nil, errs.ErrNotFoundInDB
	}
	return devs, nil
}
