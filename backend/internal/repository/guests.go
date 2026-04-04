package repository

import (
	"context"
	"errors"
	"iter"
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

const fetchAllGuestDocumentsPageSize = 100

// AllGuestDocuments returns a paginated iterator over every guest document in the
// database. It yields one *models.GuestDocument at a time, fetching the next page
// only when the previous one is exhausted. Stop iterating early by returning false
// from the yield function; the first non-nil error stops iteration and is yielded
// as the second value.
func (r *GuestsRepository) AllGuestDocuments(ctx context.Context) iter.Seq2[*models.GuestDocument, error] {
	return func(yield func(*models.GuestDocument, error) bool) {
		var cursorName, cursorID string

		for {
			rows, err := r.db.Query(ctx, `
				SELECT
					g.id,
					gb.hotel_id,
					CONCAT_WS(' ', g.first_name, g.last_name) AS full_name,
					g.first_name,
					g.last_name,
					COALESCE(g.preferences, g.first_name) AS preferred_name,
					g.email,
					g.phone,
					g.preferences,
					g.notes,
					r.floor,
					r.room_number,
					gb.group_size,
					gb.status,
					gb.arrival_date,
					gb.departure_date
				FROM guest_bookings gb
				JOIN guests g ON g.id = gb.guest_id
				JOIN rooms r ON r.id = gb.room_id
				WHERE (
					$1::text = ''
					OR (CONCAT_WS(' ', g.first_name, g.last_name), g.id::text) > ($1::text, $2::text)
				)
				ORDER BY CONCAT_WS(' ', g.first_name, g.last_name) ASC, g.id ASC
				LIMIT $3
			`, cursorName, cursorID, fetchAllGuestDocumentsPageSize)
			if err != nil {
				yield(nil, err)
				return
			}

			var page []*models.GuestDocument
			for rows.Next() {
				var doc models.GuestDocument
				if err := rows.Scan(
					&doc.ID, &doc.HotelID, &doc.FullName,
					&doc.FirstName, &doc.LastName, &doc.PreferredName,
					&doc.Email, &doc.Phone, &doc.Preferences, &doc.Notes,
					&doc.Floor, &doc.RoomNumber, &doc.GroupSize,
					&doc.BookingStatus, &doc.ArrivalDate, &doc.DepartureDate,
				); err != nil {
					rows.Close()
					yield(nil, err)
					return
				}
				page = append(page, &doc)
			}
			rows.Close()

			if err := rows.Err(); err != nil {
				yield(nil, err)
				return
			}

			for _, doc := range page {
				if !yield(doc, nil) {
					return
				}
			}

			if len(page) < fetchAllGuestDocumentsPageSize {
				return // last page
			}

			last := page[len(page)-1]
			cursorName = last.FullName
			cursorID = last.ID
		}
	}
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
