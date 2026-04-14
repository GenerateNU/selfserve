package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// requestsRowColumns matches public.requests column order for full-row scans (includes location_display).
const requestsRowColumns = `id, hotel_id, guest_id, user_id, reservation_id, name, description, room_id, request_category, request_type, department, status, priority, estimated_completion_time, scheduled_time, completed_at, notes, created_at, request_version, location_display`

func scanRequestRow(scanner interface {
	Scan(dest ...any) error
}) (*models.Request, error) {
	var request models.Request
	err := scanner.Scan(
		&request.ID, &request.HotelID, &request.GuestID, &request.UserID,
		&request.ReservationID, &request.Name, &request.Description,
		&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
		&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
		&request.CreatedAt, &request.RequestVersion, &request.LocationDisplay,
	)
	if err != nil {
		return nil, err
	}
	return &request, nil
}

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
			location_display, request_version, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
			NOW(),
			COALESCE((SELECT MIN(created_at) FROM requests WHERE id = $1), NOW())
		)
		RETURNING id, created_at, request_version
	`, req.ID, req.HotelID, req.GuestID, req.UserID, req.ReservationID, req.Name,
		req.Description, req.RoomID, req.RequestCategory, req.RequestType, req.Department,
		req.Status, req.Priority, req.EstimatedCompletionTime,
		req.ScheduledTime, req.Notes, req.LocationDisplay).Scan(&req.ID, &req.CreatedAt, &req.RequestVersion)

	if err != nil {
		return nil, err
	}

	return req, nil
}

func (r *RequestsRepository) FindRequest(ctx context.Context, id string) (*models.Request, error) {

	row := r.db.QueryRow(ctx, `
        SELECT `+requestsRowColumns+`
        FROM requests
        WHERE id = $1
        ORDER BY request_version DESC
        LIMIT 1
    `, id)

	request, err := scanRequestRow(row)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return request, nil
}

func (r *RequestsRepository) FindRequestsByStatusPaginated(ctx context.Context, cursorTime time.Time, cursorID string, status string, hotelID string, pageSize int) ([]*models.Request, time.Time, string, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (id) `+requestsRowColumns+`
			FROM requests
			WHERE status = $3 AND hotel_id = $4
			ORDER BY id, request_version DESC
		)
		SELECT `+requestsRowColumns+` FROM latest
		WHERE (request_version, id) > ($1, $2)
		ORDER BY request_version ASC, id ASC
		LIMIT $5
	`, cursorTime, cursorID, status, hotelID, pageSize+1)

	if err != nil {
		return nil, time.Time{}, "", err
	}

	defer rows.Close()

	requests := make([]*models.Request, 0)
	for rows.Next() {
		request, scanErr := scanRequestRow(rows)
		if scanErr != nil {
			return nil, time.Time{}, "", scanErr
		}
		requests = append(requests, request)
	}

	if err := rows.Err(); err != nil {
		return nil, time.Time{}, "", errs.ErrNotFoundInDB
	}

	if len(requests) == pageSize+1 {
		last := requests[pageSize-1]
		return requests[:pageSize], last.RequestVersion, last.ID, nil
	}

	return requests, time.Time{}, "", nil
}

func (r *RequestsRepository) FindRequests(ctx context.Context) ([]models.Request, error) {
	rows, err := r.db.Query(ctx, `SELECT `+requestsRowColumns+` FROM requests ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []models.Request
	for rows.Next() {
		request, scanErr := scanRequestRow(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		requests = append(requests, *request)
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

	return scanGuestRequests(rows)
}

func (r *RequestsRepository) FindMyRequestsByRoomID(ctx context.Context, roomID, hotelID, userID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version
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
				r.request_version
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

func scanGuestRequests(rows pgx.Rows) ([]*models.GuestRequest, error) {
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

// FindTasks returns up to limit+1 tasks for cursor pagination (newest sort keys first within each tab).
func (r *RequestsRepository) FindTasks(ctx context.Context, hotelID, clerkUserID string, filter models.TaskFilter, cursorRank int, cursorDeptKey string, cursorCreatedAt time.Time, cursorID string, hasCursor bool) ([]models.Task, error) {
	limit := utils.ResolveLimit(filter.Limit) + 1
	tab := string(filter.Tab)
	statusOv := strings.TrimSpace(filter.Status)
	deptF := strings.TrimSpace(filter.Department)
	priF := strings.TrimSpace(filter.Priority)

	orderBy := `r.pr DESC, r.created_at DESC, r.id DESC`
	if filter.Tab == models.TaskTabUnassigned {
		orderBy = `r.dk ASC, r.pr DESC, r.created_at DESC, r.id DESC`
	}

	args := []any{hotelID, tab, clerkUserID, statusOv, deptF, priF}
	next := 7
	var cursorSQL string
	if hasCursor {
		if filter.Tab == models.TaskTabMy {
			cursorSQL = fmt.Sprintf(
				` AND (r.pr < $%d OR (r.pr = $%d AND r.created_at < $%d) OR (r.pr = $%d AND r.created_at = $%d AND r.id::uuid < $%d::uuid))`,
				next, next, next+1, next, next+1, next+2,
			)
			args = append(args, cursorRank, cursorCreatedAt, cursorID)
			next += 3
		} else {
			cursorSQL = fmt.Sprintf(
				` AND (r.dk > $%d OR (r.dk = $%d AND (r.pr < $%d OR (r.pr = $%d AND r.created_at < $%d) OR (r.pr = $%d AND r.created_at = $%d AND r.id::uuid < $%d::uuid))))`,
				next, next, next+1, next+1, next+2, next+1, next+2, next+3,
			)
			args = append(args, cursorDeptKey, cursorRank, cursorCreatedAt, cursorID)
			next += 4
		}
	}
	args = append(args, limit)
	limitParam := next

	query := fmt.Sprintf(`
WITH latest AS (
  SELECT DISTINCT ON (r.id)
    r.id, r.user_id, r.name, r.priority, r.department, r.status, r.description, r.scheduled_time, r.created_at,
    r.room_id, r.location_display
  FROM requests r
  WHERE r.hotel_id = $1
  ORDER BY r.id ASC, r.request_version DESC
),
ranked AS (
  SELECT
    l.*,
    CASE LOWER(TRIM(COALESCE(l.priority, '')))
      WHEN 'urgent' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'middle' THEN 2 WHEN 'low' THEN 1 ELSE 0
    END AS pr,
    LOWER(TRIM(COALESCE(l.department, ''))) AS dk
  FROM latest l
  WHERE
    ($2 = 'my' AND l.user_id = $3 AND (($4 <> '' AND l.status = $4) OR ($4 = '' AND l.status IN ('assigned', 'in progress'))))
    OR
    ($2 = 'unassigned' AND l.user_id IS NULL AND (($4 <> '' AND l.status = $4) OR ($4 = '' AND l.status = 'pending')))
)
SELECT
  r.id,
  r.name,
  r.priority,
  r.department,
  r.status,
  r.description,
  r.scheduled_time,
  r.created_at,
  (r.user_id IS NOT NULL AND r.user_id <> '') AS is_assigned,
  CASE
    WHEN r.location_display IS NOT NULL AND TRIM(r.location_display) <> '' THEN TRIM(r.location_display)
    WHEN r.room_id IS NOT NULL AND TRIM(r.room_id::text) <> '' THEN 'Room ' || r.room_id::text
    ELSE 'Room unavailable'
  END AS loc
FROM ranked r
WHERE ($5 = '' OR r.dk = LOWER(TRIM($5)))
  AND ($6 = '' OR r.priority = $6)
%s
ORDER BY %s
LIMIT $%d`, cursorSQL, orderBy, limitParam)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Task
	for rows.Next() {
		var t models.Task
		var dept *string
		var createdAt time.Time
		if err := rows.Scan(
			&t.ID, &t.Title, &t.Priority, &dept, &t.Status, &t.Description, &t.DueTime, &createdAt, &t.IsAssigned, &t.Location,
		); err != nil {
			return nil, err
		}
		t.Department = dept
		cur, err := utils.EncodeTaskCursor(filter.Tab, utils.PriorityRank(t.Priority), utils.DepartmentKey(dept), createdAt, t.ID)
		if err != nil {
			return nil, err
		}
		t.Cursor = cur
		out = append(out, t)
	}
	return out, rows.Err()
}

// UpdateTaskStatus inserts a new request version with an updated status.
func (r *RequestsRepository) UpdateTaskStatus(ctx context.Context, hotelID, requestID, clerkUserID, newStatus string) error {
	base, err := r.FindRequest(ctx, requestID)
	if err != nil {
		return err
	}
	if base.HotelID != hotelID {
		return errs.ErrNotFoundInDB
	}
	if base.UserID != nil && strings.TrimSpace(*base.UserID) != "" && *base.UserID != clerkUserID {
		return errs.ErrTaskStateConflict
	}
	mr := base.MakeRequest
	mr.Status = newStatus
	_, err = r.InsertRequest(ctx, &models.Request{ID: base.ID, MakeRequest: mr})
	return err
}

// ClaimTask assigns a pending unassigned task to the given staff user (Clerk id).
func (r *RequestsRepository) ClaimTask(ctx context.Context, hotelID, requestID, clerkUserID string) error {
	base, err := r.FindRequest(ctx, requestID)
	if err != nil {
		return err
	}
	if base.HotelID != hotelID {
		return errs.ErrNotFoundInDB
	}
	if base.UserID != nil && strings.TrimSpace(*base.UserID) != "" {
		return errs.ErrTaskStateConflict
	}
	if base.Status != string(models.StatusPending) {
		return errs.ErrTaskStateConflict
	}
	mr := base.MakeRequest
	u := clerkUserID
	mr.UserID = &u
	mr.Status = string(models.StatusAssigned)
	_, err = r.InsertRequest(ctx, &models.Request{ID: base.ID, MakeRequest: mr})
	return err
}

// DropTask returns a task to the unassigned pool.
func (r *RequestsRepository) DropTask(ctx context.Context, hotelID, requestID, clerkUserID string) error {
	base, err := r.FindRequest(ctx, requestID)
	if err != nil {
		return err
	}
	if base.HotelID != hotelID {
		return errs.ErrNotFoundInDB
	}
	if base.UserID == nil || *base.UserID != clerkUserID {
		return errs.ErrTaskStateConflict
	}
	if base.Status != string(models.StatusAssigned) && base.Status != string(models.StatusInProgress) {
		return errs.ErrTaskStateConflict
	}
	mr := base.MakeRequest
	mr.UserID = nil
	mr.Status = string(models.StatusPending)
	_, err = r.InsertRequest(ctx, &models.Request{ID: base.ID, MakeRequest: mr})
	return err
}
