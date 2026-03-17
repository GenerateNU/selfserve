package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
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

func (r *GuestsRepository) FindGuestWithActiveBooking(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
	limit := utils.ResolveLimit(filter.Limit)
	search := ""
	if filter.SearchTerm != nil {
		search = strings.TrimSpace(*filter.SearchTerm)
	}

	cursor := ""
	if filter.Cursor != nil {
		cursor = strings.TrimSpace(*filter.Cursor)
	}

	rows, err := r.db.Query(ctx, `
		SELECT
			guest_id,
			government_name,
			preferred_name,
			floor,
			room_number,
			group_size
		FROM public.active_guest_list
		WHERE hotel_id = $1
			AND ($2::int[] IS NULL OR floor = ANY($2))
			AND ($3::int IS NULL OR group_size >= $3)
			AND ($4::int IS NULL OR group_size <= $4)
			AND (
				$5::text = ''
				OR government_name ILIKE '%' || $5 || '%'
				OR preferred_name ILIKE '%' || $5 || '%'
				OR room_number::text ILIKE '%' || $5 || '%'
			)
			AND ($6::text = '' OR guest_id > $6::uuid)
		ORDER BY guest_id ASC
		LIMIT $7
	`, hotelID, filter.Floors, filter.GroupSizeMin, filter.GroupSizeMax, search, cursor, limit+1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var guests []*models.GuestListItem
	for rows.Next() {
		var g models.GuestListItem
		if err := rows.Scan(
			&g.GuestID,
			&g.GovernmentName,
			&g.PreferredName,
			&g.Floor,
			&g.RoomNumber,
			&g.GroupSize,
		); err != nil {
			return nil, err
		}
		guests = append(guests, &g)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return guests, nil
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
