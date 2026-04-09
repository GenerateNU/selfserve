package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"iter"
	"sort"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
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
	guest := &models.GuestWithStays{
		CurrentStays: []models.Stay{},
		PastStays:    []models.Stay{},
	}
	var doNotDisturbStart, doNotDisturbEnd pgtype.Time
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
		&guest.Preferences, &guest.Notes, &guest.Pronouns, &doNotDisturbStart,
		&doNotDisturbEnd, &guest.HousekeepingCadence, &assistanceRaw,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	guest.DoNotDisturbStart = formatPGTime(doNotDisturbStart)
	guest.DoNotDisturbEnd = formatPGTime(doNotDisturbEnd)

	if len(assistanceRaw) > 0 && string(assistanceRaw) != "null" {
		var assistance models.Assistance
		if err := json.Unmarshal(assistanceRaw, &assistance); err != nil {
			return nil, err
		}
		guest.Assistance = &assistance
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

	if err := loadGuestStayHistory(guest, rows); err != nil {
		return nil, err
	}

	sortGuestStays(guest)

	return guest, rows.Err()
}

func loadGuestStayHistory(guest *models.GuestWithStays, rows pgx.Rows) error {
	for rows.Next() {
		var arrivalDate, departureDate pgtype.Date
		var roomNumber, groupSize pgtype.Int4
		var status string

		if err := rows.Scan(&arrivalDate, &departureDate, &roomNumber, &status, &groupSize); err != nil {
			return err
		}

		if !arrivalDate.Valid || !departureDate.Valid || !roomNumber.Valid || status == "" {
			continue
		}

		stayStatus := models.BookingStatus(status)
		stay := buildStay(arrivalDate, departureDate, roomNumber, groupSize, stayStatus)
		appendStay(guest, stay, stayStatus)
	}

	return rows.Err()
}

func buildStay(
	arrival pgtype.Date,
	departure pgtype.Date,
	roomNumber pgtype.Int4,
	groupSize pgtype.Int4,
	status models.BookingStatus,
) models.Stay {
	stay := models.Stay{
		ArrivalDate:   arrival.Time,
		DepartureDate: departure.Time,
		RoomNumber:    int(roomNumber.Int32),
		Status:        status,
	}
	if groupSize.Valid {
		value := int(groupSize.Int32)
		stay.GroupSize = &value
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

func sortGuestStays(guest *models.GuestWithStays) {
	sort.Slice(guest.CurrentStays, func(i, j int) bool {
		return guest.CurrentStays[i].ArrivalDate.After(guest.CurrentStays[j].ArrivalDate)
	})

	sort.Slice(guest.PastStays, func(i, j int) bool {
		return guest.PastStays[i].DepartureDate.After(guest.PastStays[j].DepartureDate)
	})
}

func formatPGTime(value pgtype.Time) *string {
	if !value.Valid {
		return nil
	}

	duration := time.Duration(value.Microseconds) * time.Microsecond
	hours := int(duration / time.Hour)
	duration -= time.Duration(hours) * time.Hour
	minutes := int(duration / time.Minute)
	duration -= time.Duration(minutes) * time.Minute
	seconds := int(duration / time.Second)

	formatted := fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
	return &formatted
}

func (r *GuestsRepository) UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
	var guest models.Guest

	row := r.db.QueryRow(ctx, `
		UPDATE guests
		SET
			first_name = COALESCE($2, first_name),
			last_name = COALESCE($3, last_name),
			profile_picture = COALESCE($4, profile_picture),
			timezone = COALESCE($5, timezone),
			notes = COALESCE($6, notes),
			updated_at = NOW()
		WHERE id = $1
		RETURNING
			id, created_at, updated_at,
			first_name, last_name, profile_picture, timezone, notes`,
		id,
		update.FirstName,
		update.LastName,
		update.ProfilePicture,
		update.Timezone,
		update.Notes,
	)

	err := row.Scan(
		&guest.ID,
		&guest.CreatedAt,
		&guest.UpdatedAt,
		&guest.FirstName,
		&guest.LastName,
		&guest.ProfilePicture,
		&guest.Timezone,
		&guest.Notes,
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
