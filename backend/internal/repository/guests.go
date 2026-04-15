package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"iter"
	"sort"
	"strings"
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

	if len(assistanceRaw) > 0 {
		var assistance *models.Assistance
		if err := json.Unmarshal(assistanceRaw, &assistance); err != nil {
			return nil, err
		}
		guest.Assistance = assistance
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
	sort.Slice(guest.CurrentStays, func(currentStayIndex, otherCurrentStayIndex int) bool {
		return guest.CurrentStays[currentStayIndex].ArrivalDate.After(
			guest.CurrentStays[otherCurrentStayIndex].ArrivalDate,
		)
	})

	sort.Slice(guest.PastStays, func(pastStayIndex, otherPastStayIndex int) bool {
		return guest.PastStays[pastStayIndex].DepartureDate.After(
			guest.PastStays[otherPastStayIndex].DepartureDate,
		)
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
					g.assistance,
					r.floor,
					r.room_number,
					gb.group_size,
					gb.status,
					gb.arrival_date,
					gb.departure_date,
					COALESCE(ra.request_count, 0) AS request_count,
					COALESCE(ra.has_urgent, false) AS has_urgent
				FROM guest_bookings gb
				JOIN guests g ON g.id = gb.guest_id
				JOIN rooms r ON r.id = gb.room_id
				LEFT JOIN (
					SELECT guest_id, hotel_id, COUNT(*) AS request_count, BOOL_OR(priority = 'high') AS has_urgent
					FROM requests
					GROUP BY guest_id, hotel_id
				) ra ON ra.guest_id = g.id AND ra.hotel_id = gb.hotel_id
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
					&doc.Assistance,
					&doc.Floor, &doc.RoomNumber, &doc.GroupSize,
					&doc.BookingStatus, &doc.ArrivalDate, &doc.DepartureDate,
					&doc.RequestCount, &doc.HasUrgent,
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

func scanGuests(rows pgx.Rows) ([]*models.GuestWithBooking, error) {
	var guests []*models.GuestWithBooking
	for rows.Next() {
		var g models.GuestWithBooking
		err := rows.Scan(&g.ID, &g.FirstName, &g.LastName, &g.PreferredName, &g.RequestCount, &g.HasUrgent, &g.Assistance, &g.ActiveBookings)
		if err != nil {
			return nil, err
		}
		guests = append(guests, &g)
	}
	return guests, rows.Err()
}

func buildNextCursor(guests []*models.GuestWithBooking, limit int) ([]*models.GuestWithBooking, *string) {
	if len(guests) <= limit {
		return guests, nil
	}
	guests = guests[:limit]
	last := guests[limit-1]
	encoded := last.FirstName + " " + last.LastName + "|" + last.ID
	return guests, &encoded
}

func (r *GuestsRepository) FindGuestByName(ctx context.Context, hotelID, name string) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT g.id
		FROM guests g
		JOIN guest_bookings gb ON gb.guest_id = g.id
		WHERE gb.hotel_id = $1
		  AND gb.status = 'active'
		  AND CONCAT_WS(' ', g.first_name, g.last_name) ILIKE '%' || $2 || '%'
	`, hotelID, name)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

func (r *GuestsRepository) FindGuestsWithActiveBooking(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error) {
	orderBy := buildGuestOrderBy(filters)

	rows, err := r.db.Query(ctx, `
	WITH requests_agg AS (
		SELECT
			guest_id,
			COUNT(*) AS request_count,
			BOOL_OR(priority = 'high') AS has_urgent
		FROM requests
		WHERE hotel_id = $1
		GROUP BY guest_id
	),
	guest_data AS (
		SELECT
			g.id,
			g.first_name,
			g.last_name,
			CONCAT_WS(' ', g.first_name, g.last_name) AS full_name,
			COALESCE(g.preferences, g.first_name) AS preferred_name,
			g.assistance,
			COALESCE(ra.request_count, 0) AS request_count,
			COALESCE(ra.has_urgent, false) AS has_urgent,
			COALESCE(
				json_agg(
					json_build_object('floor', r.floor, 'room_number', r.room_number)
					ORDER BY r.floor, r.room_number
				) FILTER (WHERE gb.status = 'active'),
				'[]'::json
			) AS active_bookings,
			BOOL_OR(gb.status = 'active') AS has_active_booking,
			ARRAY_AGG(DISTINCT r.floor) FILTER (WHERE gb.status = 'active') AS active_floors,
			ARRAY_AGG(DISTINCT gb.group_size) FILTER (WHERE gb.status = 'active') AS active_group_sizes,
			MIN(r.floor) FILTER (WHERE gb.status = 'active') AS min_floor
		FROM guest_bookings gb
		JOIN guests g ON g.id = gb.guest_id
		JOIN rooms r ON r.id = gb.room_id
		LEFT JOIN requests_agg ra ON ra.guest_id = g.id
		WHERE gb.hotel_id = $1
		GROUP BY g.id, g.first_name, g.last_name, g.preferences, g.assistance, ra.request_count, ra.has_urgent
	)
	SELECT id, first_name, last_name, preferred_name, request_count, has_urgent, assistance, active_bookings
	FROM guest_data
	WHERE (
		$2::text[] IS NULL
		OR ('active' = ANY($2) AND has_active_booking)
		OR ('inactive' = ANY($2) AND NOT has_active_booking)
	)
	AND ($3::int[] IS NULL OR active_floors && $3::int[])
	AND ($4::int[] IS NULL OR active_group_sizes && $4::int[])
	AND (
		$5::text = ''
		OR full_name ILIKE '%' || $5 || '%'
	)
	AND (
		$6::text = ''
		OR (full_name, id::text) > ($6::text, $7::text)
	)
	AND (
		$8::text[] IS NULL
		OR (
			('accessibility' = ANY($8) AND jsonb_array_length(COALESCE(assistance->'accessibility', '[]'::jsonb)) > 0)
			OR ('dietary' = ANY($8) AND jsonb_array_length(COALESCE(assistance->'dietary', '[]'::jsonb)) > 0)
			OR ('medical' = ANY($8) AND jsonb_array_length(COALESCE(assistance->'medical', '[]'::jsonb)) > 0)
		)
	)
	ORDER BY `+orderBy+`
	LIMIT $9`,
		filters.HotelID,
		filters.Status,
		filters.Floors,
		filters.GroupSize,
		filters.Search,
		filters.CursorName,
		filters.CursorID,
		filters.Assistance,
		filters.Limit+1,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	guests, err := scanGuests(rows)
	if err != nil {
		return nil, err
	}

	guests, nextCursor := buildNextCursor(guests, filters.Limit)

	return &models.GuestPage{
		Data:       guests,
		NextCursor: nextCursor,
	}, nil
}

func buildGuestOrderBy(filters *models.GuestFilters) string {
	var parts []string

	switch filters.RequestSort {
	case models.RequestSortUrgent:
		parts = append(parts, "has_urgent DESC")
	case models.RequestSortHighToLow:
		parts = append(parts, "request_count DESC")
	case models.RequestSortLowToHigh:
		parts = append(parts, "request_count ASC")
	}

	switch filters.FloorSort {
	case models.FloorSortAscending:
		parts = append(parts, "min_floor ASC")
	case models.FloorSortDescending:
		parts = append(parts, "min_floor DESC")
	}

	parts = append(parts, "full_name ASC", "id ASC")

	return strings.Join(parts, ", ")
}
