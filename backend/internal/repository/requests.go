package repository

import (
	"context"
	"errors"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RequestsRepository struct {
	db *pgxpool.Pool
}

func NewRequestsRepo(db *pgxpool.Pool) *RequestsRepository {
	return &RequestsRepository{db: db}
}

func (r *RequestsRepository) InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error) {
	err := r.db.QueryRow(ctx, `INSERT INTO requests (
	hotel_id, guest_id, user_id, reservation_id, name, description,
	room_id, request_category, request_type, department, status,
	priority, estimated_completion_time, scheduled_time, notes
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, created_at, updated_at
	`, req.HotelID, req.GuestID, req.UserID, req.ReservationID, req.Name,
		req.Description, req.RoomID, req.RequestCategory, req.RequestType, req.Department,
		req.Status, req.Priority, req.EstimatedCompletionTime,
		req.ScheduledTime, req.Notes).Scan(&req.ID, &req.CreatedAt, &req.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return req, nil
}

func (r *RequestsRepository) FindRequest(ctx context.Context, id string) (*models.Request, error) {

	row := r.db.QueryRow(ctx, `
        SELECT *
        FROM requests
        WHERE id = $1
    `, id)

	var request models.Request

	err := row.Scan(&request.ID, &request.HotelID, &request.GuestID,
		&request.UserID, &request.ReservationID, &request.Name, &request.Description,
		&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
		&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
		&request.CreatedAt, &request.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &request, nil
}

func (r *RequestsRepository) FindRequestsByCursor(ctx context.Context, cursor string, status string) ([]*models.Request, string, error) {
	rows, err := r.db.Query(ctx, `
			SELECT *
			FROM requests
			WHERE id > $1 AND status = $2
			ORDER BY id
			LIMIT 20
		`, cursor, status)

	if err != nil {
		return nil, "", err
	}

	defer rows.Close()

	var requests []*models.Request
	for rows.Next() {
		var request models.Request
		err := rows.Scan(&request.ID, &request.HotelID, &request.GuestID,
			&request.UserID, &request.ReservationID, &request.Name, &request.Description,
			&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
			&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
			&request.CreatedAt, &request.UpdatedAt)
		if err != nil {
			return nil, "", err
		}
		requests = append(requests, &request)
	}

	if err := rows.Err(); err != nil {
		return nil, "", errs.ErrNotFoundInDB
	}

	var nextCursor string
	if len(requests) > 0 {
		nextCursor = requests[len(requests)-1].ID
	}

	return requests, nextCursor, nil
}
