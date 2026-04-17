package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type GuestBookingsRepository struct {
	db *pgxpool.Pool
}

func NewGuestBookingsRepository(db *pgxpool.Pool) *GuestBookingsRepository {
	return &GuestBookingsRepository{db: db}
}

func (r *GuestBookingsRepository) FindGroupSizeOptions(ctx context.Context, hotelID string) ([]int, error) {
	rows, err := r.db.Query(ctx, `
        SELECT DISTINCT group_size
        FROM guest_bookings
        WHERE hotel_id = $1
          AND group_size IS NOT NULL
        ORDER BY group_size ASC
    `, hotelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sizes []int
	for rows.Next() {
		var size int
		if err := rows.Scan(&size); err != nil {
			return nil, err
		}
		sizes = append(sizes, size)
	}

	return sizes, rows.Err()
}

func (r *GuestBookingsRepository) InsertGuestBooking(ctx context.Context, guestID, roomID, hotelID string, arrivalDate, departureDate time.Time) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO guest_bookings (guest_id, room_id, hotel_id, arrival_date, departure_date, status)
		VALUES ($1, $2, $3, $4, $5, 'active')
	`, guestID, roomID, hotelID, arrivalDate, departureDate)
	return err
}
