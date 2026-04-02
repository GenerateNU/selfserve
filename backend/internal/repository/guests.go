package repository

import (
	"context"
	"encoding/json"
	"errors"
	"time"

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

func (r *GuestsRepository) FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error) {
	guest := &models.GuestWithStays{}
	var assistanceRaw []byte

	err := r.db.QueryRow(ctx, `
		SELECT 
			g.id, g.first_name, g.last_name, g.phone, g.email,
			g.preferences, g.notes, g.pronouns, g.do_not_disturb_start,
			g.do_not_disturb_end, g.housekeeping_cadence, g.assistance
		FROM public.guests g
		WHERE g.id = $1
	`, id).Scan(
		&guest.ID, &guest.FirstName, &guest.LastName, &guest.Phone, &guest.Email,
		&guest.Preferences, &guest.Notes, &guest.Pronouns, &guest.DoNotDisturbStart,
		&guest.DoNotDisturbEnd, &guest.HousekeepingCadence, &assistanceRaw,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	if err := parseAssistance(assistanceRaw, guest); err != nil {
		return nil, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT gb.arrival_date, gb.departure_date, rm.room_number, gb.status, gb.group_size
		FROM guest_bookings gb
		LEFT JOIN rooms rm ON rm.id = gb.room_id
		WHERE gb.guest_id = $1
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var arrivalDate, departureDate *time.Time
		var roomNumber, groupSize *int
		var status *models.BookingStatus

		if err := rows.Scan(&arrivalDate, &departureDate, &roomNumber, &status, &groupSize); err != nil {
			return nil, err
		}

		if arrivalDate == nil {
			continue
		}

		stay := buildStay(arrivalDate, departureDate, roomNumber, groupSize, status)
		guest = appendStay(guest, stay, *status)
	}

	return guest, rows.Err()
}

func parseAssistance(raw []byte, guest *models.GuestWithStays) error {
	if raw == nil {
		return nil
	}
	var assistance models.Assistance
	if err := json.Unmarshal(raw, &assistance); err != nil {
		return err
	}
	guest.Assistance = &assistance
	return nil
}

func buildStay(arrival, departure *time.Time, roomNumber, groupSize *int, status *models.BookingStatus) models.Stay {
	stay := models.Stay{
		ArrivalDate:   *arrival,
		DepartureDate: *departure,
		RoomNumber:    *roomNumber,
		Status:        *status,
	}
	if groupSize != nil {
		stay.GroupSize = groupSize
	}
	return stay
}

func appendStay(guest *models.GuestWithStays, stay models.Stay, status models.BookingStatus) *models.GuestWithStays {
	switch status {
	case models.BookingStatusActive:
		guest.CurrentStays = append(guest.CurrentStays, stay)
	default:
		guest.PastStays = append(guest.PastStays, stay)
	}
	return guest
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
	floorsFilter := filters.Floors
	groupSizesFilter := filters.GroupSize

	rows, err := r.db.Query(ctx, `
	WITH guest_data AS (
		SELECT
			g.id,
			g.first_name,
			g.last_name,
			CONCAT_WS(' ', g.first_name, g.last_name) AS full_name,
			COALESCE(g.preferences, g.first_name) AS preferred_name,
			r.floor,
			r.room_number,
			gb.group_size,
			gb.hotel_id,
			gb.status
		FROM guest_bookings gb
		JOIN guests g ON g.id = gb.guest_id
		JOIN rooms r ON r.id = gb.room_id
	)
	SELECT id, first_name, last_name, preferred_name, floor, room_number, group_size
	FROM guest_data
	WHERE hotel_id = $1
		AND status = 'active'
		AND ($2::int[] IS NULL OR floor = ANY($2))
		AND ($3::int[] IS NULL OR group_size = ANY($3))
		AND (
			$4::text = ''
			OR full_name ILIKE '%' || $4 || '%'
			OR room_number::text ILIKE '%' || $4 || '%'
		)
		AND (
			$5::text = ''
			OR (full_name, id::text) > ($5::text, $6::text)
		)
	ORDER BY full_name ASC, id ASC
	LIMIT $7`,
		filters.HotelID, floorsFilter, groupSizesFilter, filters.Search, filters.CursorName, filters.CursorID, filters.Limit+1,
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
