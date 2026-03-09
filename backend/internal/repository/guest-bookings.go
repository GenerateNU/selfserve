package repository

import (
	"context"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GuestBookingsRepository struct {
	db *pgxpool.Pool
}

func NewGuestBookingsRepository(db *pgxpool.Pool) *GuestBookingsRepository {
	return &GuestBookingsRepository{db: db}
}


func (r *GuestBookingsRepository) FindBookingByFloor(ctx context.Context, floors []int) ([]*models.GuestBooking, error) {

	rows, err := r.db.Query(ctx, `
	SELECT 
		guests.first_name, guests.last_name, rooms.room_number, rooms.floor, 
		rooms.suite_type, rooms.room_status
	FROM guest_bookings 
	JOIN guests ON guest_bookings.guest_id = guests.id
	JOIN rooms ON guest_bookings.room_id = rooms.id
	WHERE rooms.floor = ANY($1)`, floors)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []*models.GuestBooking
	for rows.Next() {
		var b models.GuestBooking
		err := rows.Scan(&b.ID, &b.FirstName, &b.LastName, &b.RoomNumber, &b.Floor, &b.SuiteType, &b.RoomStatus)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, &b)
	}

	return bookings, nil
}
