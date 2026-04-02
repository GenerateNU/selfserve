package repository

import (
	"context"

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