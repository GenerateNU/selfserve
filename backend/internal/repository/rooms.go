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

	// Paginate before joining with guests
	rows, err := r.db.Query(ctx, `
		WITH paginated_rooms AS (
			SELECT id, room_number, floor, suite_type, room_status, is_accessible
			FROM rooms
			WHERE hotel_id = $4
				AND ($1::int[] IS NULL OR floor = ANY($1))
				AND room_number > $2
			ORDER BY room_number ASC
			LIMIT $3
		),
		latest_requests AS (
			SELECT DISTINCT ON (r.id)
				r.id,
				r.room_id,
				r.user_id,
				r.priority,
				r.status
			FROM paginated_rooms pr
			JOIN public.requests r ON r.room_id = pr.id::text
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT
			pr.id, pr.room_number, pr.floor, pr.suite_type, pr.room_status, pr.is_accessible,
			json_agg(
				json_build_object(
					'id',              guests.id,
					'first_name',      guests.first_name,
					'last_name',       guests.last_name,
					'profile_picture', guests.profile_picture
				)
			) FILTER (WHERE guests.id IS NOT NULL) AS guests
			,
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
		FROM paginated_rooms pr
		LEFT JOIN guest_bookings ON pr.id = guest_bookings.room_id
			AND guest_bookings.status = 'active'
			AND guest_bookings.hotel_id = $4
		LEFT JOIN guests ON guests.id = guest_bookings.guest_id
		LEFT JOIN latest_requests lr ON lr.room_id = pr.id::text
		GROUP BY pr.id, pr.room_number, pr.floor, pr.suite_type, pr.room_status, pr.is_accessible
		ORDER BY pr.room_number ASC`,
		filters.Floors, cursorRoomNumber, limit+1, hotelID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*models.RoomWithOptionalGuestBooking
	for rows.Next() {
		var rb models.RoomWithOptionalGuestBooking
		var guestsJSON json.RawMessage
		err := rows.Scan(
			&rb.ID, &rb.RoomNumber, &rb.Floor, &rb.SuiteType, &rb.RoomStatus, &rb.IsAccessible,
			&guestsJSON,
			&rb.Priority,
			&rb.HasUnassignedTasks,
		)
		if err != nil {
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
	err := row.Scan(&rb.ID, &rb.RoomNumber, &rb.Floor, &rb.SuiteType, &rb.RoomStatus, &rb.IsAccessible, &guestsJSON, &rb.Priority, &rb.HasUnassignedTasks)
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
