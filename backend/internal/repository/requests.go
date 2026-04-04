package repository

import (
	"context"
	"errors"
	"time"

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
	if req.ID == "" {
		return nil, errors.New("request ID must be provided by the caller")
	}

	err := r.db.QueryRow(ctx, `
		INSERT INTO requests (
			id, hotel_id, guest_id, user_id, reservation_id, name, description,
			room_id, request_category, request_type, department, status,
			priority, estimated_completion_time, scheduled_time, notes,
			request_version, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
			NOW(),
			COALESCE((SELECT MIN(created_at) FROM requests WHERE id = $1), NOW())
		)
		RETURNING id, created_at, request_version
	`, req.ID, req.HotelID, req.GuestID, req.UserID, req.ReservationID, req.Name,
		req.Description, req.RoomID, req.RequestCategory, req.RequestType, req.Department,
		req.Status, req.Priority, req.EstimatedCompletionTime,
		req.ScheduledTime, req.Notes).Scan(&req.ID, &req.CreatedAt, &req.RequestVersion)

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
        ORDER BY request_version DESC
        LIMIT 1
    `, id)

	var request models.Request

	err := row.Scan(&request.ID, &request.HotelID, &request.GuestID,
		&request.ReservationID, &request.Name, &request.Description,
		&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
		&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
		&request.CreatedAt, &request.UserID, &request.RequestVersion)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &request, nil
}

func (r *RequestsRepository) FindRequestsByStatusPaginated(ctx context.Context, cursor string, status string, hotelID string, pageSize int) ([]*models.Request, string, error) {
	rows, err := r.db.Query(ctx, `
			SELECT *
			FROM requests
			WHERE id > $1 AND status = $2 AND hotel_id = $3
			ORDER BY id
			LIMIT $4
		`, cursor, status, hotelID, pageSize+1)

	if err != nil {
		return nil, "", err
	}

	defer rows.Close()

	var requests []*models.Request
	for rows.Next() {
		var request models.Request
		err := rows.Scan(&request.ID, &request.HotelID, &request.GuestID,
			&request.ReservationID, &request.Name, &request.Description,
			&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
			&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
			&request.CreatedAt, &request.UserID, &request.RequestVersion)
		if err != nil {
			return nil, "", err
		}
		requests = append(requests, &request)
	}

	if err := rows.Err(); err != nil {
		return nil, "", errs.ErrNotFoundInDB
	}

	if len(requests) == pageSize+1 {
		return requests[:pageSize], requests[pageSize-1].ID, nil
	}

	return requests, "", nil
}

func (r *RequestsRepository) FindRequests(ctx context.Context) ([]models.Request, error) {
	rows, err := r.db.Query(ctx, `SELECT * FROM requests ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []models.Request
	for rows.Next() {
		var request models.Request
		err := rows.Scan(&request.ID, &request.HotelID, &request.GuestID,
			&request.ReservationID, &request.Name, &request.Description,
			&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
			&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
			&request.CreatedAt, &request.UserID, &request.RequestVersion)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return requests, nil
}

func (r *RequestsRepository) FindRequestsByGuestID(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version
			FROM public.requests r
			LEFT JOIN public.rooms rm ON rm.id::text = r.room_id
			WHERE r.guest_id = $1
			  AND r.hotel_id = $2
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT * FROM latest
		WHERE ($3::text = '' OR (id::text, request_version) > ($3, $4))
		ORDER BY id ASC
		LIMIT $5
	`, guestID, hotelID, cursorID, cursorVersion, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := make([]*models.GuestRequest, 0)
	for rows.Next() {
		var req models.GuestRequest
		if err := rows.Scan(
			&req.ID, &req.Name, &req.Priority, &req.Status,
			&req.Description, &req.Notes, &req.RoomNumber,
			&req.RequestType, &req.RequestCategory, &req.CreatedAt,
			&req.RequestVersion,
		); err != nil {
			return nil, err
		}
		requests = append(requests, &req)
	}

	return requests, rows.Err()
}
