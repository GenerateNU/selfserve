package repository

import (
	"context"
	"errors"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GuestsRepository struct {
	db *pgxpool.Pool
}

func NewGuestsRepository(db *pgxpool.Pool) *GuestsRepository {
	return &GuestsRepository{db: db}
}

func (r *GuestsRepository) InsertGuest(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
	createdGuest := &models.Guest{
		CreateGuest: *guest,
	}

	err := r.db.QueryRow(ctx, `
		INSERT INTO public.guests (
			first_name, last_name, profile_picture, timezone
		) VALUES (
			$1, $2, $3, COALESCE($4, 'UTC')
		)
		RETURNING id, created_at, updated_at
	`,
		guest.FirstName,
		guest.LastName,
		guest.ProfilePicture,
		guest.Timezone,
	).Scan(&createdGuest.ID, &createdGuest.CreatedAt, &createdGuest.UpdatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				return nil, errs.ErrAlreadyExistsInDB
			}
		}
		return nil, err
	}

	return createdGuest, nil
}

func (r *GuestsRepository) FindGuest(ctx context.Context, id string) (*models.Guest, error) {

	row := r.db.QueryRow(ctx, `
		SELECT id, created_at, updated_at, first_name, last_name, profile_picture, timezone
		FROM public.guests
		WHERE id = $1
	`, id)

	var guest models.Guest

	err := row.Scan(
		&guest.ID,
		&guest.CreatedAt,
		&guest.UpdatedAt,
		&guest.FirstName,
		&guest.LastName,
		&guest.ProfilePicture,
		&guest.Timezone,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &guest, nil
}

func (r *GuestsRepository) UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
	var guest models.Guest

	row := r.db.QueryRow(ctx, `
		UPDATE guests
		SET
			first_name = $2,
			last_name = $3,
			profile_picture = $4,
			timezone = $5,
			updated_at = NOW()
		WHERE id = $1
		RETURNING
			id, created_at, updated_at,
			first_name, last_name, profile_picture, timezone`,
		id,
		update.FirstName,
		update.LastName,
		update.ProfilePicture,
		update.Timezone,
	)

	err := row.Scan(
		&guest.ID,
		&guest.CreatedAt,
		&guest.UpdatedAt,
		&guest.FirstName,
		&guest.LastName,
		&guest.ProfilePicture,
		&guest.Timezone,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &guest, nil

}
