package repository

import (
	"context"

	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomsRepository struct {
	db *pgxpool.Pool
}

func NewRoomsRepository(pool *pgxpool.Pool) *RoomsRepository {
	return &RoomsRepository{db: pool}
}

func (r *RoomsRepository) FindRoomsWithActiveBooking(ctx context.Context, filters *models.RoomFilters) ([]*models.RoomWithBooking, error) {

	rows, err := r.db.Query(ctx, `
	SELECT 
		rooms.room_number, rooms.floor, rooms.suite_type, rooms.room_status,
		guests.first_name, guests.last_name,
		guest_bookings.status as booking_status
	FROM rooms
	LEFT JOIN guest_bookings ON rooms.id = guest_bookings.room_id
		AND guest_bookings.status = 'active'
	LEFT JOIN guests ON guests.id = guest_bookings.guest_id
	WHERE rooms.floor = ANY($1)`, filters.Floors)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*models.RoomWithBooking
	for rows.Next() {
		var rb models.RoomWithBooking
		err := rows.Scan(
			&rb.RoomNumber, &rb.Floor, &rb.SuiteType, &rb.RoomStatus,
			&rb.FirstName, &rb.LastName, &rb.BookingStatus,
		)
		if err != nil {
			return nil, err
		}
		rooms = append(rooms, &rb)
	}

	return rooms, nil
}
