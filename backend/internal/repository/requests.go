package repository

import (
	"context"
	"github.com/generate/selfserve/internal/models"
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

	if (err != nil) {
		return nil, err
	}

	return req, nil
}
