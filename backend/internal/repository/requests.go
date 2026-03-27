package repository

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23503":
				switch pgErr.ConstraintName {
				case "requests_hotel_id_fkey":
					return nil, errs.ErrRequestUnknownHotel
				case "requests_user_id_fkey":
					return nil, errs.ErrRequestUnknownAssignee
				}
			case "22P02":
				return nil, errs.ErrRequestInvalidUserID
			}
		}
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

const (
	taskPriorityRankSQL = `(CASE LOWER(TRIM(priority)) WHEN 'urgent' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'middle' THEN 2 WHEN 'low' THEN 1 ELSE 0 END)`
	taskDeptKeySQL      = `LOWER(TRIM(COALESCE(department, '')))`
)

func taskPriorityRank(priority string) int {
	switch strings.ToLower(strings.TrimSpace(priority)) {
	case "urgent":
		return 4
	case "high":
		return 3
	case "medium", "middle":
		return 2
	case "low":
		return 1
	default:
		return 0
	}
}

func taskDeptKey(department *string) string {
	if department == nil {
		return ""
	}
	return strings.ToLower(strings.TrimSpace(*department))
}

func (r *RequestsRepository) FindTasks(ctx context.Context, hotelID string, userID string, filter *models.TaskFilter, cursor *models.TaskCursor) ([]*models.Task, error) {
	limit := utils.ResolveLimit(filter.Limit)
	params := []any{hotelID}

	var whereClauses []string
	whereClauses = append(whereClauses, "hotel_id = $1")

	tab := models.TaskTab(filter.Tab)
	if tab == models.TaskTabUnassigned {
		whereClauses = append(whereClauses, "user_id IS NULL")
	} else {
		params = append(params, userID)
		whereClauses = append(whereClauses, "user_id = $2")
	}

	if filter.Status != "" {
		params = append(params, filter.Status)
		whereClauses = append(whereClauses, "status = $"+strconv.Itoa(len(params)))
	} else if tab == models.TaskTabUnassigned {
		params = append(params, string(models.StatusPending))
		whereClauses = append(whereClauses, "status = $"+strconv.Itoa(len(params)))
	} else {
		params = append(params, string(models.StatusAssigned), string(models.StatusInProgress))
		whereClauses = append(whereClauses, "status IN ($"+strconv.Itoa(len(params)-1)+", $"+strconv.Itoa(len(params))+")")
	}
	if filter.Department != "" {
		params = append(params, filter.Department)
		whereClauses = append(whereClauses, "LOWER(TRIM(department)) = LOWER(TRIM($"+strconv.Itoa(len(params))+"))")
	}
	if filter.Priority != "" {
		params = append(params, filter.Priority)
		whereClauses = append(whereClauses, "priority = $"+strconv.Itoa(len(params)))
	}

	if cursor != nil {
		if tab == models.TaskTabMy {
			params = append(params, cursor.PriorityRank, cursor.CreatedAt, cursor.ID)
			n := len(params)
			whereClauses = append(whereClauses,
				"("+taskPriorityRankSQL+" < $"+strconv.Itoa(n-2)+
					" OR ("+taskPriorityRankSQL+" = $"+strconv.Itoa(n-2)+
					" AND (created_at < $"+strconv.Itoa(n-1)+
					" OR (created_at = $"+strconv.Itoa(n-1)+" AND id < $"+strconv.Itoa(n)+"::uuid))))",
			)
		} else {
			params = append(params, cursor.DeptKey, cursor.PriorityRank, cursor.CreatedAt, cursor.ID)
			n := len(params)
			whereClauses = append(whereClauses,
				"("+taskDeptKeySQL+" > $"+strconv.Itoa(n-3)+
					" OR ("+taskDeptKeySQL+" = $"+strconv.Itoa(n-3)+
					" AND ("+taskPriorityRankSQL+" < $"+strconv.Itoa(n-2)+
					" OR ("+taskPriorityRankSQL+" = $"+strconv.Itoa(n-2)+
					" AND (created_at < $"+strconv.Itoa(n-1)+
					" OR (created_at = $"+strconv.Itoa(n-1)+" AND id < $"+strconv.Itoa(n)+"::uuid))))))",
			)
		}
	}

	var orderBy string
	if tab == models.TaskTabMy {
		orderBy = taskPriorityRankSQL + " DESC, created_at DESC, id DESC"
	} else {
		orderBy = taskDeptKeySQL + " ASC, " + taskPriorityRankSQL + " DESC, created_at DESC, id DESC"
	}

	params = append(params, limit+1)
	limitParam := "$" + strconv.Itoa(len(params))
	query := `
		SELECT id, name, priority, department, room_id, location_display, description, scheduled_time, user_id, status, created_at
		FROM requests
		WHERE ` + strings.Join(whereClauses, " AND ") + `
		ORDER BY ` + orderBy + `
		LIMIT ` + limitParam

	rows, err := r.db.Query(ctx, query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*models.Task
	for rows.Next() {
		task := models.Task{}
		var roomID *string
		var locationDisplay *string
		var department *string
		var scheduledTime *time.Time
		var requestUserID *string
		var createdAt time.Time
		if err := rows.Scan(
			&task.ID,
			&task.Title,
			&task.Priority,
			&department,
			&roomID,
			&locationDisplay,
			&task.Description,
			&scheduledTime,
			&requestUserID,
			&task.Status,
			&createdAt,
		); err != nil {
			return nil, err
		}

		if department == nil || strings.TrimSpace(*department) == "" {
			task.Department = "Unknown"
		} else {
			task.Department = strings.TrimSpace(*department)
		}

		task.Location = "Room unavailable"
		if locationDisplay != nil && strings.TrimSpace(*locationDisplay) != "" {
			task.Location = strings.TrimSpace(*locationDisplay)
		} else if roomID != nil && strings.TrimSpace(*roomID) != "" {
			task.Location = "Room " + strings.TrimSpace(*roomID)
		}

		if scheduledTime != nil {
			formatted := scheduledTime.Format(time.RFC3339)
			task.DueTime = &formatted
		}
		task.IsAssigned = requestUserID != nil
		encodedCursor, err := utils.EncodeTaskCursor(models.TaskCursor{
			Tab:          tab,
			PriorityRank: taskPriorityRank(task.Priority),
			DeptKey:      taskDeptKey(department),
			CreatedAt:    createdAt,
			ID:           task.ID,
		})
		if err != nil {
			return nil, err
		}
		task.Cursor = encodedCursor
		tasks = append(tasks, &task)
	}

	return tasks, rows.Err()
}

func (r *RequestsRepository) UpdateTaskStatus(ctx context.Context, hotelID, taskID, status string) error {
	cmd, err := r.db.Exec(ctx, `
		UPDATE requests
		SET status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
	`, status, taskID, hotelID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return errs.ErrNotFoundInDB
	}
	return nil
}

func (r *RequestsRepository) ClaimTask(ctx context.Context, hotelID, taskID, staffUserID string) error {
	cmd, err := r.db.Exec(ctx, `
		UPDATE requests
		SET user_id = $1, status = $2, updated_at = now()
		WHERE id = $3::uuid AND hotel_id = $4::uuid
		  AND user_id IS NULL AND status = $5
	`, staffUserID, string(models.StatusAssigned), taskID, hotelID, string(models.StatusPending))
	if err != nil {
		return err
	}
	if cmd.RowsAffected() > 0 {
		return nil
	}
	var dummy string
	err = r.db.QueryRow(ctx, `SELECT id::text FROM requests WHERE id = $1::uuid AND hotel_id = $2::uuid`, taskID, hotelID).Scan(&dummy)
	if errors.Is(err, pgx.ErrNoRows) {
		return errs.ErrNotFoundInDB
	}
	if err != nil {
		return err
	}
	return errs.ErrTaskStateConflict
}

func (r *RequestsRepository) DropTask(ctx context.Context, hotelID, taskID, staffUserID string) error {
	cmd, err := r.db.Exec(ctx, `
		UPDATE requests
		SET user_id = NULL, status = $1, updated_at = now()
		WHERE id = $2::uuid AND hotel_id = $3::uuid
		  AND user_id = $4
		  AND status IN ($5, $6)
	`, string(models.StatusPending), taskID, hotelID, staffUserID, string(models.StatusAssigned), string(models.StatusInProgress))
	if err != nil {
		return err
	}
	if cmd.RowsAffected() > 0 {
		return nil
	}
	var dummy string
	err = r.db.QueryRow(ctx, `SELECT id::text FROM requests WHERE id = $1::uuid AND hotel_id = $2::uuid`, taskID, hotelID).Scan(&dummy)
	if errors.Is(err, pgx.ErrNoRows) {
		return errs.ErrNotFoundInDB
	}
	if err != nil {
		return err
	}
	return errs.ErrTaskStateConflict
}
