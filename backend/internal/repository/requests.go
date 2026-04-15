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

func (r *RequestsRepository) UpdateRequest(ctx context.Context, id string, update *models.UpdateRequest) (*models.Request, error) {
	var req models.Request
	err := r.db.QueryRow(ctx, `
		INSERT INTO requests (
			id, hotel_id, guest_id, user_id, reservation_id, name, description,
			room_id, request_category, request_type, department, status,
			priority, estimated_completion_time, scheduled_time, completed_at,
			notes, request_version, created_at
		)
		SELECT
			id,
			hotel_id,
			COALESCE($2, guest_id),
			COALESCE($3, user_id),
			COALESCE($4, reservation_id),
			COALESCE($5, name),
			COALESCE($6, description),
			COALESCE($7, room_id),
			COALESCE($8, request_category),
			COALESCE($9, request_type),
			COALESCE($10, department),
			COALESCE($11, status),
			COALESCE($12, priority),
			COALESCE($13, estimated_completion_time),
			COALESCE($14, scheduled_time),
			CASE WHEN $11 = 'completed' THEN NOW() ELSE COALESCE($15, completed_at) END,
			COALESCE($16, notes),
			NOW(),
			created_at
		FROM (
			SELECT DISTINCT ON (id) * FROM requests WHERE id = $1 ORDER BY id, request_version DESC
		) latest
		RETURNING id, hotel_id, guest_id, reservation_id, name, description,
		          room_id, request_category, request_type, department, status,
		          priority, estimated_completion_time, scheduled_time, completed_at,
		          notes, created_at, user_id, request_version
	`, id,
		update.GuestID, update.UserID, update.ReservationID, update.Name,
		update.Description, update.RoomID, update.RequestCategory, update.RequestType,
		update.Department, update.Status, update.Priority, update.EstimatedCompletionTime,
		update.ScheduledTime, update.CompletedAt, update.Notes,
	).Scan(
		&req.ID, &req.HotelID, &req.GuestID, &req.ReservationID, &req.Name, &req.Description,
		&req.RoomID, &req.RequestCategory, &req.RequestType, &req.Department, &req.Status,
		&req.Priority, &req.EstimatedCompletionTime, &req.ScheduledTime, &req.CompletedAt,
		&req.Notes, &req.CreatedAt, &req.UserID, &req.RequestVersion,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}
	return &req, nil
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
				r.request_version, r.department, r.user_id, rm.floor
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

	return scanGuestRequests(rows)
}

func (r *RequestsRepository) FindMyRequestsByRoomID(ctx context.Context, roomID, hotelID, userID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version, r.department, r.user_id, rm.floor
			FROM public.requests r
			LEFT JOIN public.rooms rm ON rm.id::text = r.room_id
			WHERE r.room_id = $1
			  AND r.hotel_id = $2
			  AND r.user_id = $3
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT * FROM latest
		WHERE ($4::text = '' OR (id::text, request_version) > ($4, $5))
		ORDER BY id ASC
		LIMIT $6
	`, roomID, hotelID, userID, cursorID, cursorVersion, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanGuestRequests(rows)
}

func (r *RequestsRepository) FindUnassignedRequestsByRoomID(ctx context.Context, roomID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version, r.department, r.user_id, rm.floor
			FROM public.requests r
			LEFT JOIN public.rooms rm ON rm.id::text = r.room_id
			WHERE r.room_id = $1
			  AND r.hotel_id = $2
			  AND r.user_id IS NULL
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT * FROM latest
		WHERE ($3::text = '' OR (id::text, request_version) > ($3, $4))
		ORDER BY id ASC
		LIMIT $5
	`, roomID, hotelID, cursorID, cursorVersion, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanGuestRequests(rows)
}

func (r *RequestsRepository) FindRequestsPaginated(
	ctx context.Context,
	hotelID, userID string,
	unassigned bool,
	status string,
	sort models.RequestFeedSort,
	cursorID string,
	cursorCreatedAt time.Time,
	cursorPriorityRank int,
	limit int,
) ([]*models.GuestRequest, error) {
	const baseFilter = `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version, r.department, r.user_id, rm.floor,
				CASE r.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END AS priority_rank
			FROM public.requests r
			LEFT JOIN public.rooms rm ON rm.id::text = r.room_id
			WHERE r.hotel_id = $1
			  AND ($4::text = '' OR r.status = $4)
			  AND (
			    ($3::bool AND r.user_id IS NULL)
			    OR (NOT $3::bool AND ($2::text = '' OR r.user_id = $2))
			  )
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT id, name, priority, status, description, notes, room_number,
		       request_type, request_category, created_at, request_version,
		       department, user_id, floor
		FROM latest
	`

	var (
		rows pgx.Rows
		err  error
	)

	switch sort {
	case models.SortByNewest:
		rows, err = r.db.Query(ctx, baseFilter+`
			WHERE ($5::text = '' OR (created_at, id::text) < ($6, $5))
			ORDER BY created_at DESC, id DESC
			LIMIT $7
		`, hotelID, userID, unassigned, status, cursorID, cursorCreatedAt, limit)

	case models.SortByOldest:
		rows, err = r.db.Query(ctx, baseFilter+`
			WHERE ($5::text = '' OR (created_at, id::text) > ($6, $5))
			ORDER BY created_at ASC, id ASC
			LIMIT $7
		`, hotelID, userID, unassigned, status, cursorID, cursorCreatedAt, limit)

	default: // SortByPriority
		rows, err = r.db.Query(ctx, baseFilter+`
			WHERE ($5::text = '' OR (priority_rank, id::text) > ($6::int, $5))
			ORDER BY priority_rank ASC, id ASC
			LIMIT $7
		`, hotelID, userID, unassigned, status, cursorID, cursorPriorityRank, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanGuestRequests(rows)
}

func scanGuestRequests(rows pgx.Rows) ([]*models.GuestRequest, error) {
	requests := make([]*models.GuestRequest, 0)
	for rows.Next() {
		var req models.GuestRequest
		if err := rows.Scan(
			&req.ID, &req.Name, &req.Priority, &req.Status,
			&req.Description, &req.Notes, &req.RoomNumber,
			&req.RequestType, &req.RequestCategory, &req.CreatedAt,
			&req.RequestVersion, &req.Department, &req.UserID, &req.Floor,
		); err != nil {
			return nil, err
		}
		requests = append(requests, &req)
	}
	return requests, rows.Err()
}
