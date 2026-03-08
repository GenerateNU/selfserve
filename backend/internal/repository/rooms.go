package repository

import (
	"context"
	"errors"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomsRepository struct {
	db *pgxpool.Pool
}

func NewRoomsRepository(db *pgxpool.Pool) *RoomsRepository {
	return &RoomsRepository{db: db}
}

func (r *RoomsRepository) FindRooms(ctx context.Context) ([]models.Room, error) {
	rows, err := r.db.Query(ctx, `
		SELECT *
		FROM rooms
	`)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}
	defer rows.Close()

	var rooms []models.Room

	for rows.Next() {
		var room models.Room
		err := rows.Scan(&room.ID, &room.RoomNumber, &room.RoomType,
			&room.Features, &room.CreatedAt, &room.UpdatedAt)
			
		if err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}

	return rooms, nil
}
