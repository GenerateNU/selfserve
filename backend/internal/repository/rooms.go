package repository

import (
	"context"
	"encoding/json"

	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
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
			SELECT id, room_number, floor, suite_type, room_status
			FROM rooms
			WHERE hotel_id = $4
				AND ($1::int[] IS NULL OR floor = ANY($1))
				AND room_number > $2
			ORDER BY room_number ASC
			LIMIT $3
		)
		SELECT
			pr.room_number, pr.floor, pr.suite_type, pr.room_status,
			json_agg(
				json_build_object(
					'id',              guests.id,
					'first_name',      guests.first_name,
					'last_name',       guests.last_name,
					'profile_picture', guests.profile_picture
				)
			) FILTER (WHERE guests.id IS NOT NULL) AS guests
		FROM paginated_rooms pr
		LEFT JOIN guest_bookings ON pr.id = guest_bookings.room_id
			AND guest_bookings.status = 'active'
			AND guest_bookings.hotel_id = $4
		LEFT JOIN guests ON guests.id = guest_bookings.guest_id
		GROUP BY pr.id, pr.room_number, pr.floor, pr.suite_type, pr.room_status
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
			&rb.RoomNumber, &rb.Floor, &rb.SuiteType, &rb.RoomStatus,
			&guestsJSON,
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
