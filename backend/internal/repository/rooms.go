package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomsRepository struct {
	db *pgxpool.Pool
}

func NewRoomsRepository(pool *pgxpool.Pool) *RoomsRepository {
	return &RoomsRepository{db: pool}
}

func (r *RoomsRepository) FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filters *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
	limit := utils.ResolveLimit(filters.Limit)

	statusFilters := filters.Status
	if statusFilters == nil {
		statusFilters = []string{}
	}
	attrFilters := filters.Attributes
	if attrFilters == nil {
		attrFilters = []string{}
	}
	advFilters := filters.Advanced
	if advFilters == nil {
		advFilters = []string{}
	}

	// $1 = hotelID, $2 = floors, $3 = status filters, $4 = attribute filters,
	// $5 = advanced filters, $6 = cursorRoomNumber, $7 = limit+1
	const base = `
		WITH open_task_rooms AS (
			SELECT DISTINCT room_id::uuid AS room_id
			FROM (
				SELECT DISTINCT ON (id) id, room_id, status
				FROM requests
				WHERE hotel_id = $1 AND room_id IS NOT NULL
				ORDER BY id, request_version DESC
			) latest
			WHERE status != 'archived'
		),
		room_task_info AS (
			SELECT
				room_id::uuid AS room_id,
				COALESCE(
					CASE
						WHEN BOOL_OR(priority = 'high') THEN 'high'
						WHEN BOOL_OR(priority = 'medium') THEN 'medium'
						ELSE 'low'
					END,
					'low'
				) AS priority,
				BOOL_OR(user_id IS NULL) AS has_unassigned_tasks
			FROM (
				SELECT DISTINCT ON (id) id, room_id, status, priority, user_id
				FROM requests
				WHERE hotel_id = $1 AND room_id IS NOT NULL
				ORDER BY id, request_version DESC
			) latest
			WHERE status != 'archived'
			GROUP BY room_id
		),
		room_enriched AS (
			SELECT
				r.id, r.room_number, r.floor, r.suite_type, r.room_status, r.is_accessible,
				CASE WHEN COUNT(gb_active.id) > 0 THEN 'active' ELSE 'inactive' END AS booking_status,
				BOOL_OR(otr.room_id IS NOT NULL)  AS has_open_tasks,
				BOOL_OR(gb_arrive.id IS NOT NULL) AS has_arrivals_today,
				BOOL_OR(gb_depart.id IS NOT NULL) AS has_departures_today,
				json_agg(
					json_build_object(
						'id',              g.id,
						'first_name',      g.first_name,
						'last_name',       g.last_name,
						'profile_picture', g.profile_picture
					)
				) FILTER (WHERE g.id IS NOT NULL) AS guests,
				COALESCE(MAX(rti.priority), 'low') AS priority,
				COALESCE(BOOL_OR(rti.has_unassigned_tasks), FALSE) AS has_unassigned_tasks
			FROM rooms r
			LEFT JOIN guest_bookings gb_active ON r.id = gb_active.room_id
				AND gb_active.status = 'active'
				AND gb_active.hotel_id = $1
			LEFT JOIN guests g ON g.id = gb_active.guest_id
			LEFT JOIN guest_bookings gb_arrive ON r.id = gb_arrive.room_id
				AND gb_arrive.hotel_id = $1
				AND gb_arrive.arrival_date = CURRENT_DATE
			LEFT JOIN guest_bookings gb_depart ON r.id = gb_depart.room_id
				AND gb_depart.hotel_id = $1
				AND gb_depart.departure_date = CURRENT_DATE
			LEFT JOIN open_task_rooms otr ON r.id = otr.room_id
			LEFT JOIN room_task_info rti ON r.id = rti.room_id
			WHERE r.hotel_id = $1
				AND ($2::int[] IS NULL OR r.floor = ANY($2))
			GROUP BY r.id, r.room_number, r.floor, r.suite_type, r.room_status, r.is_accessible
		)
		SELECT id, room_number, floor, suite_type, room_status, is_accessible, booking_status, guests, priority, has_unassigned_tasks
		FROM room_enriched
		WHERE (cardinality($3::text[]) = 0 OR (
				('occupied'   = ANY($3) AND booking_status = 'active')
			 OR ('vacant'     = ANY($3) AND booking_status = 'inactive')
			 OR ('open-tasks' = ANY($3) AND has_open_tasks)
		))
		  AND (cardinality($4::text[]) = 0 OR (
				('standard'   = ANY($4) AND LOWER(suite_type) = 'standard')
			 OR ('deluxe'     = ANY($4) AND LOWER(suite_type) = 'deluxe')
			 OR ('suite'      = ANY($4) AND LOWER(suite_type) LIKE '%suite%')
			 OR ('accessible' = ANY($4) AND is_accessible)
		))
		  AND (cardinality($5::text[]) = 0 OR (
				('arrivals-today'   = ANY($5) AND has_arrivals_today)
			 OR ('departures-today' = ANY($5) AND has_departures_today)
		))
	`

	var (
		rows pgx.Rows
		err  error
	)

	switch filters.Sort {
	case models.RoomSortDescending:
		rows, err = r.db.Query(ctx, base+`
			AND ($6::int = 0 OR room_number < $6)
			ORDER BY room_number DESC
			LIMIT $7
		`, hotelID, filters.Floors, statusFilters, attrFilters, advFilters, cursorRoomNumber, limit+1)

	case models.RoomSortUrgency:
		rows, err = r.db.Query(ctx, base+`
			AND ($6::int = 0 OR room_number > $6)
			ORDER BY has_open_tasks DESC, room_number ASC
			LIMIT $7
		`, hotelID, filters.Floors, statusFilters, attrFilters, advFilters, cursorRoomNumber, limit+1)

	default: // ascending
		rows, err = r.db.Query(ctx, base+`
			AND ($6::int = 0 OR room_number > $6)
			ORDER BY room_number ASC
			LIMIT $7
		`, hotelID, filters.Floors, statusFilters, attrFilters, advFilters, cursorRoomNumber, limit+1)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*models.RoomWithOptionalGuestBooking
	for rows.Next() {
		var rb models.RoomWithOptionalGuestBooking
		var guestsJSON json.RawMessage
		if err := rows.Scan(
			&rb.ID, &rb.RoomNumber, &rb.Floor, &rb.SuiteType, &rb.RoomStatus, &rb.IsAccessible,
			&rb.BookingStatus,
			&guestsJSON,
			&rb.Priority,
			&rb.HasUnassignedTasks,
		); err != nil {
			return nil, err
		}
		if guestsJSON != nil {
			if err := json.Unmarshal(guestsJSON, &rb.Guests); err != nil {
				return nil, err
			}
		}
		rooms = append(rooms, &rb)
	}
	return rooms, nil
}

func (r *RoomsRepository) FindAllFloors(ctx context.Context, hotelID string) ([]int, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT floor
		FROM rooms
		WHERE hotel_id = $1
		ORDER BY floor ASC`, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var floors []int
	for rows.Next() {
		var floor int
		if err := rows.Scan(&floor); err != nil {
			return nil, err
		}
		floors = append(floors, floor)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return floors, nil
}

func (r *RoomsRepository) FindRoomByID(ctx context.Context, hotelID string, id string) (*models.RoomWithOptionalGuestBooking, error) {
	row := r.db.QueryRow(ctx, `
		WITH latest_requests AS (
			SELECT DISTINCT ON (r.id)
				r.id,
				r.room_id,
				r.user_id,
				r.priority,
				r.status
			FROM public.requests r
			WHERE r.hotel_id = $2
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT
			r.id, r.room_number, r.floor, r.suite_type, r.room_status, r.is_accessible,
			CASE WHEN COUNT(gb.id) > 0 THEN 'active' ELSE 'inactive' END AS booking_status,
			json_agg(
				json_build_object(
					'id',              g.id,
					'first_name',      g.first_name,
					'last_name',       g.last_name,
					'profile_picture', g.profile_picture
				)
			) FILTER (WHERE g.id IS NOT NULL) AS guests,
			COALESCE(
				CASE
					WHEN BOOL_OR(lr.status != 'completed' AND lr.priority = 'high') THEN 'high'
					WHEN BOOL_OR(lr.status != 'completed' AND lr.priority = 'medium') THEN 'medium'
					WHEN BOOL_OR(lr.status != 'completed' AND lr.priority = 'low') THEN 'low'
					ELSE 'low'
				END,
				'low'
			) AS priority,
			COALESCE(BOOL_OR(lr.status != 'completed' AND lr.user_id IS NULL), FALSE) AS has_unassigned_tasks
		FROM rooms r
		LEFT JOIN guest_bookings gb ON r.id = gb.room_id
			AND gb.status = 'active'
			AND gb.hotel_id = $2
		LEFT JOIN guests g ON g.id = gb.guest_id
		LEFT JOIN latest_requests lr ON lr.room_id = r.id::text
		WHERE r.id = $1 AND r.hotel_id = $2
		GROUP BY r.id, r.room_number, r.floor, r.suite_type, r.room_status, r.is_accessible`,
		id, hotelID)

	var rb models.RoomWithOptionalGuestBooking
	var guestsJSON json.RawMessage
	err := row.Scan(&rb.ID, &rb.RoomNumber, &rb.Floor, &rb.SuiteType, &rb.RoomStatus, &rb.IsAccessible, &rb.BookingStatus, &guestsJSON, &rb.Priority, &rb.HasUnassignedTasks)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}
	if guestsJSON != nil {
		if err := json.Unmarshal(guestsJSON, &rb.Guests); err != nil {
			return nil, err
		}
	}
	return &rb, nil
}

func (r *RoomsRepository) InsertRoom(ctx context.Context, hotelID string, roomNumber, floor int, suiteType, roomStatus string, isAccessible bool, features []string) (*models.Room, error) {
	var room models.Room
	err := r.db.QueryRow(ctx, `
		INSERT INTO rooms (hotel_id, room_number, floor, suite_type, room_status, is_accessible, features)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, room_number, floor, suite_type, room_status, is_accessible
	`, hotelID, roomNumber, floor, suiteType, roomStatus, isAccessible, features).
		Scan(&room.ID, &room.RoomNumber, &room.Floor, &room.SuiteType, &room.RoomStatus, &room.IsAccessible)
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *RoomsRepository) FindRoomByNumber(ctx context.Context, hotelID string, roomReference string) (*models.Room, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, room_number, floor, suite_type, room_status, is_accessible
		FROM rooms
		WHERE hotel_id = $1
			AND room_number::text = $2
		LIMIT 2`,
		hotelID, roomReference)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*models.Room
	for rows.Next() {
		var room models.Room
		if err := rows.Scan(&room.ID, &room.RoomNumber, &room.Floor, &room.SuiteType, &room.RoomStatus, &room.IsAccessible); err != nil {
			return nil, err
		}
		rooms = append(rooms, &room)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(rooms) == 0 {
		return nil, errs.ErrNotFoundInDB
	}
	if len(rooms) > 1 {
		return nil, errs.ErrAlreadyExistsInDB
	}
	return rooms[0], nil
}
