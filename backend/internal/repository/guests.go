package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/google/uuid"
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

func (r *GuestsRepository) FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error) {

	rows, err := r.db.Query(ctx, `
		SELECT guests.id, guests.first_name, guests.last_name, guests.phone, guests.email,
			guests.preferences, guests.notes, guest_bookings.arrival_date, guest_bookings.departure_date,
			rooms.room_number, guest_bookings.status
		FROM public.guests
		LEFT JOIN guest_bookings ON guests.id = guest_bookings.guest_id
		LEFT JOIN rooms ON rooms.id = guest_bookings.room_id
		WHERE guests.id = $1
	`, id)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var guest *models.GuestWithStays
	for rows.Next() {
		var stay models.Stay
		var arrivalDate *time.Time
		var departureDate *time.Time
		var roomNumber *int
		var status *models.BookingStatus

		if guest == nil {
			guest = &models.GuestWithStays{}
		}

		err := rows.Scan(
			&guest.ID, &guest.FirstName, &guest.LastName, &guest.Phone, &guest.Email, &guest.Preferences, &guest.Notes,
			&arrivalDate, &departureDate, &roomNumber, &status,
		)
		if err != nil {
			return nil, err
		}

		if arrivalDate == nil {
			continue
		}

		stay.ArrivalDate = *arrivalDate
		stay.DepartureDate = *departureDate
		stay.RoomNumber = *roomNumber
		stay.Status = *status

		switch *status {
		case models.BookingStatusActive:
			guest.CurrentStays = append(guest.CurrentStays, stay)
		case models.BookingStatusInactive:
			guest.PastStays = append(guest.PastStays, stay)
		default:
			return nil, errs.InternalServerError()
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if guest == nil {
		return nil, errs.ErrNotFoundInDB
	}

	return guest, nil
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

func (r *GuestsRepository) FindGuestsWithActiveBooking(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error) {
	var floors []int
	if len(filters.Floors) > 0 {
		floors = filters.Floors
	}

	var groupSizes []int
	if len(filters.GroupSize) > 0 {
		groupSizes = filters.GroupSize
	}

	var cursorName, cursorID string
	if filters.Cursor != "" {
		parts := strings.SplitN(filters.Cursor, "|", 2)
		if len(parts) != 2 {
			return nil, errs.ErrInvalidCursor
		}
		if _, err := uuid.Parse(parts[1]); err != nil {
			return nil, errs.ErrInvalidCursor
		}
		cursorName = parts[0]
		cursorID = parts[1]
	}

	rows, err := r.db.Query(ctx, `
	SELECT
		g.id,
		g.first_name,
		g.last_name,
		COALESCE(g.preferences, g.first_name) AS preferred_name,
		r.floor,
		r.room_number,
		gb.group_size
	FROM guest_bookings gb
	JOIN guests g ON g.id = gb.guest_id
	JOIN rooms r ON r.id = gb.room_id
	WHERE gb.hotel_id = $1
		AND gb.status = 'active'
		AND ($2::int[] IS NULL OR r.floor = ANY($2))
		AND ($3::int[] IS NULL OR gb.group_size = ANY($3))
		AND (
			$4::text = ''
			OR CONCAT_WS(' ', g.first_name, g.last_name) ILIKE '%' || $4 || '%'
			OR r.room_number::text ILIKE '%' || $4 || '%'
		)
		AND (
			$5::text = ''
			OR (CONCAT_WS(' ', g.first_name, g.last_name), g.id) > ($5::text, $6::uuid)
		)
	ORDER BY CONCAT_WS(' ', g.first_name, g.last_name) ASC, g.id ASC
	LIMIT $7`,
		filters.HotelID, floors, groupSizes, filters.Search, cursorName, cursorID, filters.Limit+1,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var guests []*models.GuestWithBooking
	for rows.Next() {
		var g models.GuestWithBooking
		err := rows.Scan(&g.ID, &g.FirstName, &g.LastName, &g.PreferredName, &g.Floor, &g.RoomNumber, &g.GroupSize)
		if err != nil {
			return nil, err
		}
		guests = append(guests, &g)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	var nextCursor *string
	if len(guests) == filters.Limit+1 {
		guests = guests[:filters.Limit]
		last := guests[filters.Limit-1]
		encoded := last.FirstName + " " + last.LastName + "|" + last.ID
		nextCursor = &encoded
	}

	return &models.GuestPage{
		Data:       guests,
		NextCursor: nextCursor,
	}, nil
}
