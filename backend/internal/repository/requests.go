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
	priority, estimated_completion_time, scheduled_time, notes,
	request_version
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
		RETURNING id, created_at, updated_at, request_version
	`, req.HotelID, req.GuestID, req.UserID, req.ReservationID, req.Name,
		req.Description, req.RoomID, req.RequestCategory, req.RequestType, req.Department,
		req.Status, req.Priority, req.EstimatedCompletionTime,
		req.ScheduledTime, req.Notes).Scan(&req.ID, &req.CreatedAt, &req.UpdatedAt, &req.RequestVersion)

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

	err := row.Scan(&request.ID, &request.CreatedAt, &request.UpdatedAt, &request.HotelID, &request.GuestID,
		&request.UserID, &request.ReservationID, &request.Name, &request.Description,
		&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
		&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
		&request.RequestVersion)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &request, nil
}

func (r *RequestsRepository) FindRequests(ctx context.Context) ([]models.Request, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT ON (id) *
		FROM requests
		ORDER BY id, request_version DESC
	`)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}
	defer rows.Close()

	var requests []models.Request

	for rows.Next() {
		var request models.Request
		err := rows.Scan(&request.ID, &request.CreatedAt, &request.UpdatedAt, &request.HotelID, &request.GuestID,
			&request.UserID, &request.ReservationID, &request.Name, &request.Description,
			&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
			&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
			&request.RequestVersion)
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

func (r *RequestsRepository) InsertRequestVersion(ctx context.Context, id string, update *models.UpdateRequest) (*models.Request, error) {
	latest, err := r.FindRequest(ctx, id)

	if err != nil {
		return nil, err
	}

	// if body contains changes, update otherwise keep original request field data
	if update.Description != nil {
		latest.Description = update.Description
	}
	if update.Status != nil {
		latest.Status = *update.Status
	}
	if update.Priority != nil {
		latest.Priority = *update.Priority
	}
	if update.EstimatedCompletionTime != nil {
		latest.EstimatedCompletionTime = update.EstimatedCompletionTime
	}
	if update.ScheduledTime != nil {
		latest.ScheduledTime = update.ScheduledTime
	}
	if update.CompletedAt != nil {
		latest.CompletedAt = update.CompletedAt
	}
	if update.Notes != nil {
		latest.Notes = update.Notes
	}

	row := r.db.QueryRow(ctx, `
		INSERT INTO requests (
			id, hotel_id, guest_id, user_id, reservation_id, name, description,
			room_id, request_category, request_type, department, status,
			priority, estimated_completion_time, scheduled_time, completed_at,
			notes, request_version
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
		RETURNING id, created_at, updated_at, request_version
	`,
		latest.ID, latest.HotelID, latest.GuestID, latest.UserID, latest.ReservationID,
		latest.Name, latest.Description, latest.RoomID, latest.RequestCategory,
		latest.RequestType, latest.Department, latest.Status, latest.Priority,
		latest.EstimatedCompletionTime, latest.ScheduledTime, latest.CompletedAt,
		latest.Notes)

	var newVersion models.Request
	newVersion.MakeRequest = latest.MakeRequest

	err = row.Scan(&newVersion.ID, &newVersion.CreatedAt, &newVersion.UpdatedAt, &newVersion.RequestVersion)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return &newVersion, nil
}
