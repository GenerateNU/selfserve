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
			request_version, created_at, changed_by
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
			NOW(),
			COALESCE((SELECT MIN(created_at) FROM requests WHERE id = $1), NOW()),
			$17
		)
		RETURNING id, created_at, request_version
	`, req.ID, req.HotelID, req.GuestID, req.UserID, req.ReservationID, req.Name,
		req.Description, req.RoomID, req.RequestCategory, req.RequestType, req.Department,
		req.Status, req.Priority, req.EstimatedCompletionTime,
		req.ScheduledTime, req.Notes, req.ChangedBy).Scan(&req.ID, &req.CreatedAt, &req.RequestVersion)

	if err != nil {
		return nil, err
	}

	return req, nil
}

func (r *RequestsRepository) UpdateRequest(ctx context.Context, id string, update *models.RequestUpdateInput, changedBy *string) (*models.Request, error) {
	row := r.db.QueryRow(ctx, `
		WITH current AS (
			SELECT *
			FROM requests
			WHERE id = $1
			ORDER BY request_version DESC
			LIMIT 1
		)
		INSERT INTO requests (
			id, hotel_id, guest_id, user_id, reservation_id, name, description,
			room_id, request_category, request_type, department, status,
			priority, estimated_completion_time, scheduled_time, completed_at, notes,
			request_version, created_at, changed_by
		)
		SELECT
			current.id,
			current.hotel_id,
			COALESCE($2, current.guest_id),
			CASE WHEN $17 THEN NULL ELSE COALESCE($3, current.user_id) END,
			COALESCE($4, current.reservation_id),
			COALESCE($5, current.name),
			COALESCE($6, current.description),
			COALESCE($7, current.room_id),
			COALESCE($8, current.request_category),
			COALESCE($9, current.request_type),
			COALESCE($10, current.department),
			COALESCE($11, current.status),
			COALESCE($12, current.priority),
			COALESCE($13, current.estimated_completion_time),
			COALESCE($14, current.scheduled_time),
			COALESCE($15, current.completed_at),
			COALESCE($16, current.notes),
			NOW(),
			current.created_at,
			$18
		FROM current
		RETURNING id, created_at, request_version
	`, id,
		update.GuestID,
		update.UserID,
		update.ReservationID,
		update.Name,
		update.Description,
		update.RoomID,
		update.RequestCategory,
		update.RequestType,
		update.Department,
		update.Status,
		update.Priority,
		update.EstimatedCompletionTime,
		update.ScheduledTime,
		update.CompletedAt,
		update.Notes,
		update.Unassign,
		changedBy,
	)

	var req models.Request
	if err := row.Scan(&req.ID, &req.CreatedAt, &req.RequestVersion); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.ErrNotFoundInDB
		}
		return nil, err
	}

	return r.FindRequest(ctx, id)
}

func (r *RequestsRepository) FindRequest(ctx context.Context, id string) (*models.Request, error) {

	row := r.db.QueryRow(ctx, `
		WITH latest AS (
			SELECT * FROM requests WHERE id = $1 ORDER BY request_version DESC LIMIT 1
		)
		SELECT * FROM latest WHERE status != 'archived'
	`, id)

	var request models.Request

	err := row.Scan(&request.ID, &request.HotelID, &request.GuestID,
		&request.ReservationID, &request.Name, &request.Description,
		&request.RoomID, &request.RequestCategory, &request.RequestType, &request.Department, &request.Status,
		&request.Priority, &request.EstimatedCompletionTime, &request.ScheduledTime, &request.CompletedAt, &request.Notes,
		&request.CreatedAt, &request.UserID, &request.RequestVersion, &request.ChangedBy)

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
		SELECT * FROM (
			SELECT DISTINCT ON (id) * FROM requests ORDER BY id, request_version DESC
		) latest
		WHERE status != 'archived'
		ORDER BY created_at DESC
	`)
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
			&request.CreatedAt, &request.UserID, &request.RequestVersion, &request.ChangedBy)
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
		WHERE status != 'archived'
		  AND ($3::text = '' OR (id::text, request_version) > ($3, $4))
		ORDER BY id ASC
		LIMIT $5
	`, guestID, hotelID, cursorID, cursorVersion, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanGuestRequests(rows)
}

func (r *RequestsRepository) FindRequestsByRoomIDAndUserID(ctx context.Context, roomID, hotelID, userID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version, r.department AS department_id, d.name AS department_name, r.user_id, rm.floor
			FROM public.requests r
			LEFT JOIN public.rooms rm ON rm.id::text = r.room_id
			LEFT JOIN public.departments d ON d.id::text = r.department
			WHERE r.room_id = $1
			  AND r.hotel_id = $2
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT id, name, priority, status, description, notes, room_number,
		       request_type, request_category, created_at, request_version,
		       department_id, department_name, user_id, floor
		FROM latest
		WHERE status != 'archived'
		  AND user_id = $3
		  AND ($4::text = '' OR (id::text, request_version) > ($4, $5))
		ORDER BY id ASC
		LIMIT $6
	`, roomID, hotelID, userID, cursorID, cursorVersion, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanGuestRequests(rows)
}

func (r *RequestsRepository) FindUnassignedRequestsByRoomIDAndUserID(ctx context.Context, roomID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version, r.department AS department_id, d.name AS department_name, r.user_id, rm.floor
			FROM public.requests r
			LEFT JOIN public.rooms rm ON rm.id::text = r.room_id
			LEFT JOIN public.departments d ON d.id::text = r.department
			WHERE r.room_id = $1
			  AND r.hotel_id = $2
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT id, name, priority, status, description, notes, room_number,
		       request_type, request_category, created_at, request_version,
		       department_id, department_name, user_id, floor
		FROM latest
		WHERE status != 'archived'
		  AND user_id IS NULL
		  AND ($3::text = '' OR (id::text, request_version) > ($3, $4))
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
	input *models.RequestsFeedInput,
	cursorID string,
	cursorCreatedAt time.Time,
	cursorPriorityRank int,
	limit int,
) ([]*models.GuestRequest, error) {
	priorities := input.Priorities
	if priorities == nil {
		priorities = []string{}
	}
	departments := input.Departments
	if departments == nil {
		departments = []string{}
	}
	floors := input.Floors
	if floors == nil {
		floors = []int{}
	}
	const baseFilter = `
		WITH latest AS (
			SELECT DISTINCT ON (r.id)
				r.id, r.name, r.priority, r.status, r.description, r.notes,
				rm.room_number, r.request_type, r.request_category, r.created_at,
				r.request_version, r.department AS department_id, d.name AS department_name, r.user_id, rm.floor,
				CASE r.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END AS priority_rank
			FROM public.requests r
			LEFT JOIN public.rooms rm ON rm.id::text = r.room_id
			LEFT JOIN public.departments d ON d.id::text = r.department
			WHERE r.hotel_id = $1
			  AND ($4::text = '' OR r.status = $4)
			  AND (cardinality($5::text[]) = 0 OR r.priority = ANY($5))
			  AND (cardinality($7::int[]) = 0 OR rm.floor = ANY($7))
			  AND ($8::text = '' OR r.name ILIKE '%' || $8 || '%' OR r.description ILIKE '%' || $8 || '%')
			ORDER BY r.id ASC, r.request_version DESC
		)
		SELECT id, name, priority, status, description, notes, room_number,
		       request_type, request_category, created_at, request_version,
		       department_id, department_name, user_id, floor
		FROM latest
		WHERE status != 'archived'
		  AND (
		    ($3::bool AND user_id IS NULL)
		    OR (NOT $3::bool AND ($2::text = '' OR user_id = $2))
		)
		  AND (cardinality($6::text[]) = 0 OR department_id = ANY($6))
	`

	var (
		rows pgx.Rows
		err  error
	)

	switch input.Sort {
	case models.SortByNewest:
		rows, err = r.db.Query(ctx, baseFilter+`
			AND ($9::text = '' OR (created_at, id::text) < ($10, $9))
			ORDER BY created_at DESC, id DESC
			LIMIT $11
		`, input.HotelID, input.UserID, input.Unassigned, input.Status, priorities, departments, floors, input.Search, cursorID, cursorCreatedAt, limit)

	case models.SortByOldest:
		rows, err = r.db.Query(ctx, baseFilter+`
			AND ($9::text = '' OR (created_at, id::text) > ($10, $9))
			ORDER BY created_at ASC, id ASC
			LIMIT $11
		`, input.HotelID, input.UserID, input.Unassigned, input.Status, priorities, departments, floors, input.Search, cursorID, cursorCreatedAt, limit)

	default: // SortByPriority
		rows, err = r.db.Query(ctx, baseFilter+`
			AND ($9::text = '' OR (priority_rank, id::text) > ($10::int, $9))
			ORDER BY priority_rank ASC, id ASC
			LIMIT $11
		`, input.HotelID, input.UserID, input.Unassigned, input.Status, priorities, departments, floors, input.Search, cursorID, cursorPriorityRank, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanGuestRequests(rows)
}

func (r *RequestsRepository) GetRequestsOverview(ctx context.Context, hotelID string, filters *models.FilterRoomsRequest) (*models.RequestsOverview, error) {
	statusFilters := filters.Status
	if statusFilters == nil {
		statusFilters = []string{}
	}
	attrFilters := filters.Attributes
	if attrFilters == nil {
		attrFilters = []string{}
	}
	advFilters := filters.Advanced
	if advFilters == nil {
		advFilters = []string{}
	}

	// $1 = hotelID, $2 = floors, $3 = status filters, $4 = attribute filters, $5 = advanced filters
	var overview models.RequestsOverview
	err := r.db.QueryRow(ctx, `
		WITH room_task_info AS (
			SELECT
				room_id::uuid AS room_id,
				BOOL_OR(user_id IS NULL) AS has_unassigned_tasks
			FROM (
				SELECT DISTINCT ON (id) id, room_id, status, user_id
				FROM requests
				WHERE hotel_id = $1 AND room_id IS NOT NULL
				ORDER BY id, request_version DESC
			) latest
			WHERE status NOT IN ('completed', 'archived')
			GROUP BY room_id
		),
		room_enriched AS (
			SELECT
				r.id, r.suite_type, r.room_status, r.is_accessible,
				CASE WHEN COUNT(gb_active.id) > 0 THEN 'active' ELSE 'inactive' END AS booking_status,
				BOOL_OR(gb_arrive.id IS NOT NULL) AS has_arrivals_today,
				BOOL_OR(gb_depart.id IS NOT NULL) AS has_departures_today,
				COALESCE(BOOL_OR(rti.has_unassigned_tasks), FALSE) AS has_unassigned_tasks
			FROM rooms r
			LEFT JOIN guest_bookings gb_active ON r.id = gb_active.room_id
				AND gb_active.status = 'active'
				AND gb_active.hotel_id = $1
			LEFT JOIN guest_bookings gb_arrive ON r.id = gb_arrive.room_id
				AND gb_arrive.hotel_id = $1
				AND gb_arrive.arrival_date = CURRENT_DATE
			LEFT JOIN guest_bookings gb_depart ON r.id = gb_depart.room_id
				AND gb_depart.hotel_id = $1
				AND gb_depart.departure_date = CURRENT_DATE
			LEFT JOIN room_task_info rti ON r.id = rti.room_id
			WHERE r.hotel_id = $1
				AND ($2::int[] IS NULL OR r.floor = ANY($2))
			GROUP BY r.id, r.suite_type, r.room_status, r.is_accessible
		),
		filtered_rooms AS (
			SELECT id FROM room_enriched
			WHERE (cardinality($3::text[]) = 0 OR (
					('occupied'   = ANY($3) AND booking_status = 'active')
				 OR ('vacant'     = ANY($3) AND booking_status = 'inactive')
				 OR ('open-tasks' = ANY($3) AND has_unassigned_tasks)
			))
			  AND (cardinality($4::text[]) = 0 OR (
					('standard'   = ANY($4) AND LOWER(suite_type) = 'standard')
				 OR ('deluxe'     = ANY($4) AND LOWER(suite_type) = 'deluxe')
				 OR ('suite'      = ANY($4) AND LOWER(suite_type) LIKE '%suite%')
				 OR ('accessible' = ANY($4) AND is_accessible)
			))
			  AND (cardinality($5::text[]) = 0 OR (
					('arrivals-today'   = ANY($5) AND has_arrivals_today)
				 OR ('departures-today' = ANY($5) AND has_departures_today)
			))
		),
		latest_requests AS (
			SELECT DISTINCT ON (id) id, room_id, status, priority, user_id
			FROM requests
			WHERE hotel_id = $1 AND room_id IS NOT NULL
			ORDER BY id, request_version DESC
		),
		active_requests AS (
			SELECT lr.priority, lr.status, lr.user_id
			FROM latest_requests lr
			INNER JOIN filtered_rooms fr ON fr.id = lr.room_id::uuid
			WHERE lr.status NOT IN ('completed', 'archived')
		)
		SELECT
			COUNT(*) FILTER (WHERE priority = 'high')  AS urgent,
			COUNT(*) FILTER (WHERE user_id IS NULL)     AS unassigned,
			COUNT(*) FILTER (WHERE status = 'pending')  AS pending
		FROM active_requests
	`, hotelID, filters.Floors, statusFilters, attrFilters, advFilters).
		Scan(&overview.Urgent, &overview.Unassigned, &overview.Pending)
	if err != nil {
		return nil, err
	}

	return &overview, nil
}

func (r *RequestsRepository) FindRequestVersions(ctx context.Context, id string) ([]*models.Request, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, hotel_id, guest_id, reservation_id, name, description,
		       room_id, request_category, request_type, department, status,
		       priority, estimated_completion_time, scheduled_time, completed_at, notes,
		       created_at, user_id, request_version, changed_by
		FROM requests
		WHERE id = $1
		ORDER BY request_version ASC
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []*models.Request
	for rows.Next() {
		var req models.Request
		if err := rows.Scan(
			&req.ID, &req.HotelID, &req.GuestID,
			&req.ReservationID, &req.Name, &req.Description,
			&req.RoomID, &req.RequestCategory, &req.RequestType, &req.Department, &req.Status,
			&req.Priority, &req.EstimatedCompletionTime, &req.ScheduledTime, &req.CompletedAt, &req.Notes,
			&req.CreatedAt, &req.UserID, &req.RequestVersion, &req.ChangedBy,
		); err != nil {
			return nil, err
		}
		versions = append(versions, &req)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(versions) == 0 {
		return nil, errs.ErrNotFoundInDB
	}
	return versions, nil
}

func (r *RequestsRepository) FindRequestsByStatusPaginated(ctx context.Context, cursor string, status string, hotelID string, pageSize int) ([]*models.Request, string, error) {
	rows, err := r.db.Query(ctx, `
		WITH latest AS (
			SELECT DISTINCT ON (id) *
			FROM requests
			WHERE hotel_id = $1
			ORDER BY id, request_version DESC
		)
		SELECT *
		FROM latest
		WHERE status != 'archived'
		  AND status = $2
		  AND ($3::text = '' OR id::text > $3)
		ORDER BY id
		LIMIT $4
	`, hotelID, status, cursor, pageSize+1)
	if err != nil {
		return nil, "", err
	}
	defer rows.Close()

	requests := make([]*models.Request, 0, pageSize)
	for rows.Next() {
		var req models.Request
		if err := rows.Scan(
			&req.ID, &req.HotelID, &req.GuestID,
			&req.ReservationID, &req.Name, &req.Description,
			&req.RoomID, &req.RequestCategory, &req.RequestType, &req.Department, &req.Status,
			&req.Priority, &req.EstimatedCompletionTime, &req.ScheduledTime, &req.CompletedAt, &req.Notes,
			&req.CreatedAt, &req.UserID, &req.RequestVersion, &req.ChangedBy,
		); err != nil {
			return nil, "", err
		}
		requests = append(requests, &req)
	}
	if err := rows.Err(); err != nil {
		return nil, "", err
	}

	if len(requests) == pageSize+1 {
		return requests[:pageSize], requests[pageSize-1].ID, nil
	}
	return requests, "", nil
}

func scanGuestRequests(rows pgx.Rows) ([]*models.GuestRequest, error) {
	requests := make([]*models.GuestRequest, 0)
	for rows.Next() {
		var req models.GuestRequest
		if err := rows.Scan(
			&req.ID, &req.Name, &req.Priority, &req.Status,
			&req.Description, &req.Notes, &req.RoomNumber,
			&req.RequestType, &req.RequestCategory, &req.CreatedAt,
			&req.RequestVersion, &req.DepartmentID, &req.DepartmentName, &req.UserID, &req.Floor,
		); err != nil {
			return nil, err
		}
		requests = append(requests, &req)
	}
	return requests, rows.Err()
}
