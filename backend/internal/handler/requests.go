package handler

import (
	"context"
	"errors"
	"log/slog"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	temporalclient "github.com/generate/selfserve/internal/temporal"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const msgTaskAssigned = "New task assigned to you"

// NotificationSender is implemented by the notifications service.
// It is nilable - if nil, notification triggering is skipped.
type NotificationSender interface {
	Notify(ctx context.Context, userID string, notifType models.NotificationType, title, body string) error
}

type RequestsHandler struct {
	RequestRepository      storage.RequestsRepository
	GenerateRequestService aiflows.GenerateRequestService
	WorkflowClient         temporalclient.GenerateRequestWorkflowClient
	NotificationSender     NotificationSender
}

func NewRequestsHandler(repo storage.RequestsRepository, generateRequestService aiflows.GenerateRequestService, notificationSender NotificationSender) *RequestsHandler {
	return &RequestsHandler{
		RequestRepository:      repo,
		GenerateRequestService: generateRequestService,
		NotificationSender:     notificationSender,
	}
}

// CreateRequest godoc
// @Summary      creates a request
// @Description  Creates a request with the given data
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param  request  body  models.MakeRequest  true  "Request data"
// @Success      200   {object}  models.Request
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Security     BearerAuth
// @Router       /request [post]
func (r *RequestsHandler) CreateRequest(c *fiber.Ctx) error {
	var requestBody models.MakeRequest
	if err := httpx.BindAndValidate(c, &requestBody); err != nil {
		return err
	}

	var changedBy *string
	if uid, ok := c.Locals("userId").(string); ok && uid != "" {
		changedBy = &uid
	}

	req := models.Request{ID: uuid.New().String(), MakeRequest: requestBody, ChangedBy: changedBy}
	res, err := r.RequestRepository.InsertRequest(c.Context(), &req)
	if err != nil {
		return errs.InternalServerError()
	}

	if r.NotificationSender != nil && requestBody.UserID != nil {
		if err := r.NotificationSender.Notify(c.Context(), *requestBody.UserID, models.TypeTaskAssigned, msgTaskAssigned, res.Name); err != nil {
			slog.Error("failed to send task assigned notification", "err", err)
		}
	}

	return c.JSON(res)
}

// UpdateRequest godoc
// @Summary      Update a request
// @Description  Partially updates a request — only fields present in the body are applied; omitted fields keep their current values
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param        id       path  string              true  "Request ID (UUID)"
// @Param        request  body  models.RequestUpdateInput  true  "Fields to update"
// @Success      200  {object}  models.Request
// @Failure      400  {object}  errs.HTTPError
// @Failure      404  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /request/{id} [put]
func (r *RequestsHandler) UpdateRequest(c *fiber.Ctx) error {
	id := c.Params("id")
	if !validUUID(id) {
		return errs.BadRequest("request id is not a valid UUID")
	}

	var patchInput models.RequestUpdateInput
	if err := httpx.BindAndValidate(c, &patchInput); err != nil {
		return err
	}

	var changedBy *string
	if uid, ok := c.Locals("userId").(string); ok && uid != "" {
		changedBy = &uid
	}

	res, err := r.RequestRepository.UpdateRequest(c.Context(), id, &patchInput, changedBy)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("Request", "id", id)
		}
		slog.Error("failed to update request", "err", err, "requestID", id)
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

// AssignRequest godoc
// @Summary      Assign a request to a user
// @Description  Sets user_id on the latest request version. Set assign_to_self to true to assign to the caller. Omit assign_to_self (or set to false) and provide user_id to assign to another user. Requires X-Hotel-ID to match the request's hotel.
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param        id          path    string                    true  "Request ID (UUID)"
// @Param        X-Hotel-ID  header  string                    true  "Hotel ID (UUID)"
// @Param        body        body    models.AssignRequestInput true  "Self-assign flag and optional assignee"
// @Success      200  {object}  models.Request
// @Failure      400  {object}  errs.HTTPError
// @Failure      401  {object}  errs.HTTPError
// @Failure      404  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /request/{id}/assign [post]
func (r *RequestsHandler) AssignRequest(c *fiber.Ctx) error {
	userID, ok := c.Locals("userId").(string)
	if !ok || userID == "" {
		return errs.Unauthorized()
	}

	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	requestID := c.Params("id")
	if !validUUID(requestID) {
		return errs.BadRequest("request id is not a valid UUID")
	}

	var body models.AssignRequestInput
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return err
	}

	var assigneeID string
	if body.AssignToSelf != nil && *body.AssignToSelf {
		assigneeID = userID
	} else {
		if body.UserID == nil || strings.TrimSpace(*body.UserID) == "" {
			return errs.BadRequest("user_id is required when assign_to_self is false or not provided")
		}
		assigneeID = strings.TrimSpace(*body.UserID)
	}

	request, err := r.RequestRepository.FindRequest(c.Context(), requestID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("request", "id", requestID)
		}
		return errs.InternalServerError()
	}
	if request.HotelID != hotelID {
		return errs.NotFound("request", "id", requestID)
	}

	update := models.RequestUpdateInput{UserID: &assigneeID}
	res, err := r.RequestRepository.UpdateRequest(c.Context(), requestID, &update, &userID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("request", "id", requestID)
		}
		slog.Error("failed to assign request", "err", err, "requestID", requestID)
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

func (r *RequestsHandler) GetRequest(c *fiber.Ctx) error {
	id := c.Params("id")
	if !validUUID(id) {
		return errs.BadRequest("request id is not a valid UUID")
	}
	// add some parsing into UUID type?
	dev, err := r.RequestRepository.FindRequest(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("request", "id", id)
		}
		return errs.InternalServerError()
	}

	return c.JSON(dev)
}

func (r *RequestsHandler) GetRequests(c *fiber.Ctx) error {

	dev, err := r.RequestRepository.FindRequests(c.Context())
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(dev)
}

func validateGenerateRequest(input *models.GenerateRequestInput) error {
	errors := make(map[string]string)

	if input.RawText == "" {
		errors["raw_text"] = "must not be an empty string"
	}

	if len(errors) > 0 {
		var keys []string
		for k := range errors {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		var parts []string
		for _, k := range keys {
			parts = append(parts, k+": "+errors[k])
		}
		return errs.BadRequest(strings.Join(parts, ", "))
	}

	return nil
}

// GenerateRequest godoc
// @Summary      generates a request
// @Description  Generates a request using AI
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param  request  body  models.GenerateRequestInput  true  "Request data with raw text"
// @Success      200   {object}  models.GenerateRequestResponse
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/generate [post]
func (r *RequestsHandler) GenerateRequest(c *fiber.Ctx) error {
	var input models.GenerateRequestInput
	if err := c.BodyParser(&input); err != nil {
		return errs.InvalidJSON()
	}

	if err := httpx.Validate(&input); err != nil {
		return err
	}

	if err := validateGenerateRequest(&input); err != nil {
		return err
	}

	parsed, err := r.GenerateRequestService.RunGenerateRequest(c.Context(), aiflows.GenerateRequestInput{
		RawText: input.RawText,
		HotelID: input.HotelID,
	})
	if err != nil {
		slog.Error("genkit failed to generate a request", "error", err)
		return errs.InternalServerError()
	}
	if err := httpx.Validate(&parsed); err != nil {
		slog.Error("generated request failed validation", "error", err)
		return errs.InternalServerError()
	}

	notes := parsed.Notes
	if notes == nil {
		empty := ""
		notes = &empty
	}

	req := models.Request{ID: uuid.New().String(), MakeRequest: models.MakeRequest{
		HotelID:                 input.HotelID,
		GuestID:                 parsed.GuestID,
		UserID:                  parsed.UserID,
		ReservationID:           parsed.ReservationID,
		RoomID:                  parsed.RoomID,
		Name:                    parsed.Name,
		Description:             parsed.Description,
		RequestCategory:         parsed.RequestCategory,
		RequestType:             parsed.RequestType,
		Department:              parsed.DepartmentID,
		Status:                  parsed.Status,
		Priority:                parsed.Priority,
		EstimatedCompletionTime: parsed.EstimatedCompletionTime,
		ScheduledTime:           nil, // TODO: Potentially add schedule time from user input / auto-scheduling
		CompletedAt:             nil,
		Notes:                   notes,
	}}

	return c.JSON(models.GenerateRequestResponse{
		Request: req,
		Warning: warningFromAI(parsed.Warning),
	})
}

func warningFromAI(w *aiflows.GenerateRequestWarning) *models.GenerateRequestWarning {
	if w == nil {
		return nil
	}

	return &models.GenerateRequestWarning{
		Code:    w.Code,
		Message: w.Message,
	}
}

// StartGenerateRequestAsync godoc
// @Summary      starts request generation workflow
// @Description  Starts async request generation via Temporal workflow
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param  request  body  models.GenerateRequestInput  true  "Request data with raw text"
// @Success      202   {object}  map[string]string
// @Failure      400   {object}  map[string]string
// @Failure      503   {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/generate/async [post]
func (r *RequestsHandler) StartGenerateRequestAsync(c *fiber.Ctx) error {
	if r.WorkflowClient == nil {
		return errs.NewHTTPError(fiber.StatusServiceUnavailable, errors.New("temporal workflow client unavailable"))
	}

	var input models.GenerateRequestInput
	if err := c.BodyParser(&input); err != nil {
		return errs.InvalidJSON()
	}
	if err := httpx.Validate(&input); err != nil {
		return err
	}
	if err := validateGenerateRequest(&input); err != nil {
		return err
	}

	workflowID, err := r.WorkflowClient.StartGenerateRequest(c.Context(), aiflows.GenerateRequestInput{
		RawText: input.RawText,
		HotelID: input.HotelID,
	})
	if err != nil {
		slog.Error("failed to start generate request workflow", "error", err)
		return errs.InternalServerError()
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"workflow_id": workflowID,
	})
}

// GetGenerateRequestStatus godoc
// @Summary      gets request generation workflow status
// @Description  Gets async request generation workflow status/result
// @Tags         requests
// @Produce      json
// @Param        workflowId  path  string  true  "Workflow ID"
// @Success      200   {object}  map[string]interface{}
// @Failure      404   {object}  map[string]string
// @Failure      503   {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/generate/async/{workflowId} [get]
func (r *RequestsHandler) GetGenerateRequestStatus(c *fiber.Ctx) error {
	if r.WorkflowClient == nil {
		return errs.NewHTTPError(fiber.StatusServiceUnavailable, errors.New("temporal workflow client unavailable"))
	}

	workflowID := c.Params("workflowId")
	if workflowID == "" {
		return errs.BadRequest("workflow id is required")
	}

	result, err := r.WorkflowClient.GetGenerateRequestResult(c.Context(), workflowID)
	if err != nil {
		if temporalclient.IsWorkflowNotFound(err) {
			return errs.NotFound("workflow", "id", workflowID)
		}
		slog.Error("failed to get generate request workflow status", "error", err, "workflow_id", workflowID)
		return errs.InternalServerError()
	}

	statusCode := fiber.StatusOK
	if result.Status == "pending" {
		statusCode = fiber.StatusAccepted
	}

	return c.Status(statusCode).JSON(result)
}

// GetRequestsByGuest godoc
// @Summary      Get requests by guest
// @Description  Retrieves all requests for a given guest
// @Tags         requests
// @Produce      json
// @Param        id  path  string  true  "Guest ID (UUID)"
// @Success      200  {object}  utils.CursorPage[models.GuestRequest]
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/guest/{id} [get]
func (r *RequestsHandler) GetRequestsByGuest(c *fiber.Ctx) error {
	input := models.GetRequestsByGuestInput{
		GuestID: c.Params("id"),
		HotelID: c.Get("X-Hotel-ID"),
		Cursor:  c.Query("cursor"),
		Limit:   c.QueryInt("limit"),
	}
	if err := httpx.Validate(&input); err != nil {
		return err
	}

	cursorID, cursorVersion, err := parseRequestCursor(input.Cursor)
	if err != nil {
		return errs.BadRequest("invalid cursor")
	}

	limit := utils.ResolveLimit(input.Limit)
	requests, err := r.RequestRepository.FindRequestsByGuestID(c.Context(), input.GuestID, input.HotelID, cursorID, cursorVersion, limit+1)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(requests, limit, func(req *models.GuestRequest) string {
		return req.ID + "|" + req.RequestVersion.UTC().Format(time.RFC3339Nano)
	})

	return c.JSON(page)
}

// GetRequestsByRoomID godoc
// @Summary      Get requests by room
// @Description  Returns two lists for the given room and hotel: requests assigned to the caller and unassigned requests
// @Tags         requests
// @Produce      json
// @Param        id          path    string  true  "Room ID (UUID)"
// @Param        X-Hotel-ID  header  string  true  "Hotel ID (UUID)"
// @Success      200  {object}  models.RoomRequestsResponse
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/room/{id} [get]
func (r *RequestsHandler) GetRequestsByRoomID(c *fiber.Ctx) error {
	userID, ok := c.Locals("userId").(string)
	if !ok || userID == "" {
		return errs.Unauthorized()
	}

	input := models.GetRequestsByRoomInput{
		RoomID:  c.Params("id"),
		HotelID: c.Get("X-Hotel-ID"),
	}
	if err := httpx.Validate(&input); err != nil {
		return err
	}

	assigned, err := r.RequestRepository.FindRequestsByRoomIDAndUserID(c.Context(), input.RoomID, input.HotelID, userID, "", time.Time{}, utils.DefaultPageLimit)
	if err != nil {
		slog.Error("FindRequestsByRoomIDAndUserID failed", "err", err, "roomID", input.RoomID)
		return errs.InternalServerError()
	}

	unassigned, err := r.RequestRepository.FindUnassignedRequestsByRoomIDAndUserID(c.Context(), input.RoomID, input.HotelID, "", time.Time{}, utils.DefaultPageLimit)
	if err != nil {
		slog.Error("FindUnassignedRequestsByRoomIDAndUserID failed", "err", err, "roomID", input.RoomID)
		return errs.InternalServerError()
	}

	return c.JSON(models.RoomRequestsResponse{
		Assigned:   assigned,
		Unassigned: unassigned,
	})
}

// GetRequestsFeed godoc
// @Summary      Get requests feed
// @Description  Returns a paginated list of requests for the hotel, optionally filtered and searched
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param        request  body  models.RequestsFeedInput  true  "Feed filters"
// @Success      200  {object}  utils.CursorPage[models.GuestRequest]
// @Failure      400  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /requests/feed [post]
func (r *RequestsHandler) GetRequestsFeed(c *fiber.Ctx) error {
	var input models.RequestsFeedInput
	if err := httpx.BindAndValidate(c, &input); err != nil {
		return err
	}

	if input.Sort == "" {
		input.Sort = models.SortByPriority
	}

	cursorID, cursorCreatedAt, cursorPriorityRank, err := parseFeedCursor(input.Cursor)
	if err != nil {
		return errs.BadRequest("invalid cursor")
	}

	resolvedLimit := utils.ResolveLimit(input.Limit)
	requests, err := r.RequestRepository.FindRequestsPaginated(
		c.Context(), &input,
		cursorID, cursorCreatedAt, cursorPriorityRank,
		resolvedLimit+1,
	)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(requests, resolvedLimit, buildFeedCursor)

	return c.JSON(page)
}

// GetRequestsOverview godoc
// @Summary      Get requests overview counts
// @Description  Returns counts of urgent (high priority), unassigned, and pending tasks scoped to the rooms matching the given filters. Accepts the same filter body as POST /rooms. Does not mutate any data.
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param        X-Hotel-ID  header  string                    true  "Hotel ID"
// @Param        body        body    models.FilterRoomsRequest false "Room filters"
// @Success      200  {object}  models.RequestsOverview
// @Failure      400  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /requests/overview [post]
func (r *RequestsHandler) GetRequestsOverview(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	var body models.FilterRoomsRequest
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return err
	}

	overview, err := r.RequestRepository.GetRequestsOverview(c.Context(), hotelID, &body)
	if err != nil {
		slog.Error("failed to get requests overview", "err", err, "hotelID", hotelID)
		return errs.InternalServerError()
	}

	return c.JSON(overview)
}

// GetRequestActivity godoc
// @Summary      Get request activity history
// @Description  Returns a cursor-paginated list of activity events derived from the request's version history, newest first
// @Tags         requests
// @Produce      json
// @Param        id      path   string  true   "Request ID (UUID)"
// @Param        cursor  query  string  false  "Pagination cursor (timestamp of last seen item)"
// @Param        limit   query  int     false  "Page size (default 20, max 100)"
// @Success      200  {object}  models.RequestActivityPage
// @Failure      400  {object}  errs.HTTPError
// @Failure      404  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /request/{id}/activity [get]
func (r *RequestsHandler) GetRequestActivity(c *fiber.Ctx) error {
	id := c.Params("id")
	if !validUUID(id) {
		return errs.BadRequest("request id is not a valid UUID")
	}

	limit := c.QueryInt("limit", 20)
	if limit < 1 || limit > 100 {
		limit = 20
	}

	var cursor time.Time
	if cursorStr := c.Query("cursor"); cursorStr != "" {
		var err error
		cursor, err = time.Parse(time.RFC3339Nano, cursorStr)
		if err != nil {
			return errs.BadRequest("invalid cursor")
		}
	}

	versions, err := r.RequestRepository.FindRequestVersions(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("Request", "id", id)
		}
		slog.Error("failed to fetch request versions", "err", err, "requestID", id)
		return errs.InternalServerError()
	}

	all := buildRequestActivity(versions)
	// Reverse to newest-first
	for i, j := 0, len(all)-1; i < j; i, j = i+1, j-1 {
		all[i], all[j] = all[j], all[i]
	}

	// Apply cursor: skip items at or after the cursor timestamp
	start := 0
	if !cursor.IsZero() {
		for i, item := range all {
			if item.Timestamp.Before(cursor) {
				start = i
				break
			}
		}
		if start == 0 {
			return c.JSON(&models.RequestActivityPage{Items: []*models.RequestActivityItem{}})
		}
	}

	page := all[start:]
	var nextCursor *string
	if len(page) > limit {
		page = page[:limit]
		t := page[limit-1].Timestamp.UTC().Format(time.RFC3339Nano)
		nextCursor = &t
	}

	return c.JSON(&models.RequestActivityPage{Items: page, NextCursor: nextCursor})
}

func buildRequestActivity(versions []*models.Request) []*models.RequestActivityItem {
	items := make([]*models.RequestActivityItem, 0, len(versions))

	for i, v := range versions {
		if i == 0 {
			items = append(items, &models.RequestActivityItem{
				Type:      models.ActivityCreated,
				ChangedBy: v.ChangedBy,
				Timestamp: v.RequestVersion,
			})
			continue
		}

		prev := versions[i-1]

		if v.Status != prev.Status {
			old, cur := prev.Status, v.Status
			items = append(items, &models.RequestActivityItem{
				Type:      models.ActivityStatusChanged,
				ChangedBy: v.ChangedBy,
				OldValue:  &old,
				NewValue:  &cur,
				Timestamp: v.RequestVersion,
			})
		}

		if v.Priority != prev.Priority {
			old, cur := prev.Priority, v.Priority
			items = append(items, &models.RequestActivityItem{
				Type:      models.ActivityPriorityChanged,
				ChangedBy: v.ChangedBy,
				OldValue:  &old,
				NewValue:  &cur,
				Timestamp: v.RequestVersion,
			})
		}

		prevUserID := ""
		if prev.UserID != nil {
			prevUserID = *prev.UserID
		}
		curUserID := ""
		if v.UserID != nil {
			curUserID = *v.UserID
		}
		if prevUserID != curUserID {
			if curUserID == "" {
				items = append(items, &models.RequestActivityItem{
					Type:      models.ActivityUnassigned,
					ChangedBy: v.ChangedBy,
					OldValue:  &prevUserID,
					Timestamp: v.RequestVersion,
				})
			} else {
				items = append(items, &models.RequestActivityItem{
					Type:      models.ActivityAssigned,
					ChangedBy: v.ChangedBy,
					NewValue:  &curUserID,
					Timestamp: v.RequestVersion,
				})
			}
		}

		if v.Name != prev.Name {
			old, cur := prev.Name, v.Name
			items = append(items, &models.RequestActivityItem{
				Type:      models.ActivityNameChanged,
				ChangedBy: v.ChangedBy,
				OldValue:  &old,
				NewValue:  &cur,
				Timestamp: v.RequestVersion,
			})
		}

		prevDept := ""
		if prev.Department != nil {
			prevDept = *prev.Department
		}
		curDept := ""
		if v.Department != nil {
			curDept = *v.Department
		}
		if prevDept != curDept {
			items = append(items, &models.RequestActivityItem{
				Type:      models.ActivityDepartmentChanged,
				ChangedBy: v.ChangedBy,
				OldValue:  &prevDept,
				NewValue:  &curDept,
				Timestamp: v.RequestVersion,
			})
		}

		prevRoom := ""
		if prev.RoomID != nil {
			prevRoom = *prev.RoomID
		}
		curRoom := ""
		if v.RoomID != nil {
			curRoom = *v.RoomID
		}
		if prevRoom != curRoom {
			items = append(items, &models.RequestActivityItem{
				Type:      models.ActivityRoomChanged,
				ChangedBy: v.ChangedBy,
				OldValue:  &prevRoom,
				NewValue:  &curRoom,
				Timestamp: v.RequestVersion,
			})
		}

		prevDesc := ""
		if prev.Description != nil {
			prevDesc = *prev.Description
		}
		curDesc := ""
		if v.Description != nil {
			curDesc = *v.Description
		}
		if prevDesc != curDesc {
			items = append(items, &models.RequestActivityItem{
				Type:      models.ActivityDescriptionChanged,
				ChangedBy: v.ChangedBy,
				OldValue:  &prevDesc,
				NewValue:  &curDesc,
				Timestamp: v.RequestVersion,
			})
		}
	}

	return items
}

// parseFeedCursor decodes a universal cursor: "priority_rank|created_at_nano|id".
// Returns zero values and nil error for an empty cursor (first page).
func parseFeedCursor(cursor string) (id string, createdAt time.Time, priorityRank int, err error) {
	if cursor == "" {
		return "", time.Time{}, 0, nil
	}
	parts := strings.SplitN(cursor, "|", 3)
	if len(parts) != 3 {
		return "", time.Time{}, 0, errors.New("invalid cursor")
	}
	rank, rankErr := strconv.Atoi(parts[0])
	nano, nanoErr := strconv.ParseInt(parts[1], 10, 64)
	if rankErr != nil || nanoErr != nil {
		return "", time.Time{}, 0, errors.New("invalid cursor")
	}
	return parts[2], time.Unix(0, nano).UTC(), rank, nil
}

// buildFeedCursor encodes all sort fields into a single universal cursor.
func buildFeedCursor(req *models.GuestRequest) string {
	return strconv.Itoa(priorityRankOf(req.Priority)) + "|" +
		strconv.FormatInt(req.CreatedAt.UnixNano(), 10) + "|" +
		req.ID
}

func priorityRankOf(priority string) int {
	switch priority {
	case "high":
		return 1
	case "medium":
		return 2
	default:
		return 3
	}
}

// parseRequestCursor splits a "id|request_version" cursor string.
// Returns zero values and nil error when cursor is empty (first page).
func parseRequestCursor(cursor string) (id string, version time.Time, err error) {
	if cursor == "" {
		return "", time.Time{}, nil
	}
	parts := strings.SplitN(cursor, "|", 2)
	if len(parts) != 2 {
		return "", time.Time{}, errors.New("invalid cursor")
	}
	version, err = time.Parse(time.RFC3339Nano, parts[1])
	if err != nil {
		return "", time.Time{}, errors.New("invalid cursor")
	}
	return parts[0], version, nil
}
