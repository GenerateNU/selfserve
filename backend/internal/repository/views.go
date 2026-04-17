package repository

import (
	"context"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ViewsRepository struct {
	db *pgxpool.Pool
}

func NewViewsRepository(db *pgxpool.Pool) *ViewsRepository {
	return &ViewsRepository{db: db}
}

func (r *ViewsRepository) FindAllByUserAndSlug(ctx context.Context, userID string, slug models.ViewSlug) ([]*models.View, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, slug, display_name, filters, created_at, updated_at
		FROM public.views
		WHERE user_id = $1 AND slug = $2
		ORDER BY created_at ASC
	`, userID, slug)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var views []*models.View
	for rows.Next() {
		v := &models.View{}
		var filters []byte
		if err := rows.Scan(&v.ID, &v.UserID, &v.Slug, &v.DisplayName, &filters, &v.CreatedAt, &v.UpdatedAt); err != nil {
			return nil, err
		}
		v.Filters = filters
		views = append(views, v)
	}
	return views, rows.Err()
}

func (r *ViewsRepository) Insert(ctx context.Context, userID string, input models.CreateViewInput) (*models.View, error) {
	v := &models.View{
		ID:          uuid.New().String(),
		UserID:      userID,
		Slug:        input.Slug,
		DisplayName: input.DisplayName,
		Filters:     input.Filters,
	}
	err := r.db.QueryRow(ctx, `
		INSERT INTO public.views (id, user_id, slug, display_name, filters)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at
	`, v.ID, v.UserID, v.Slug, v.DisplayName, []byte(v.Filters)).Scan(&v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return v, nil
}

func (r *ViewsRepository) Delete(ctx context.Context, id, userID string) error {
	result, err := r.db.Exec(ctx, `
		DELETE FROM public.views WHERE id = $1 AND user_id = $2
	`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errs.ErrNotFoundInDB
	}
	return nil
}
