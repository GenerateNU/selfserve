package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

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

func buildRoomFilterQuery(cursor string, filters []models.RoomFilters, limit int) (string, []any) {
	query := `SELECT * FROM rooms WHERE ($1 = '' OR id > $1)`
	args := []any{cursor}
	argPos := 2

	var filterGroups []string
	for _, f := range filters {
		var clauses []string
		appendFilterClause(&clauses, &args, &argPos, "floor", f.Floors)
		appendFilterClause(&clauses, &args, &argPos, "room_type", f.RoomTypes)

		if len(clauses) > 0 {
			filterGroups = append(filterGroups, "("+strings.Join(clauses, " AND ")+")")
		}
	}

	if len(filterGroups) > 0 {
		query += " AND (" + strings.Join(filterGroups, " OR ") + ")"
	}

	query += fmt.Sprintf(" ORDER BY id LIMIT $%d", argPos)
	args = append(args, limit)

	return query, args
}

func (r *RoomsRepository) FindRoomsByFiltersPaginated(ctx context.Context, cursor string, filters []models.RoomFilters, limit int) ([]models.Room, error) {
	query, args := buildRoomFilterQuery(cursor, filters, limit)

	rows, err := r.db.Query(ctx, query, args...)
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

func appendFilterClause[T any](clauses *[]string, args *[]any, argPos *int, column string, values []T) {
	if len(values) == 0 {
		return
	}
	*clauses = append(*clauses, fmt.Sprintf("%s = ANY($%d)", column, *argPos))
	*args = append(*args, values)
	*argPos++
}
