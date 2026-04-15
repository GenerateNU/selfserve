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
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const defaultPageSize = 20

const msgTaskAssigned = "New task assigned to you"

// NotificationSender is implemented by the notifications service.
// It is nilable - if nil, notification triggering is skipped.
type NotificationSender interface {
	Notify(ctx context.Context, userID string, notifType models.NotificationType, title, body string) error
}

type RequestsHandler struct {
	RequestRepository      storage.RequestsRepository
	GenerateRequestService aiflows.GenerateRequestService
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

	res, err := r.RequestRepository.InsertRequest(c.Context(), &models.Request{ID: uuid.New().String(), MakeRequest: requestBody})
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

func (r *RequestsHandler) UpdateRequest(c *fiber.Ctx) error {
	id := c.Params("id")
	if !validUUID(id) {
		return errs.BadRequest("request id is not a valid UUID")
	}

	var requestBody models.MakeRequest
	if err := httpx.BindAndValidate(c, &requestBody); err != nil {
		return err
	}

	res, err := r.RequestRepository.InsertRequest(c.Context(), &models.Request{ID: id, MakeRequest: requestBody})
	if err != nil {
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

// GetRequestByCursor godoc
// @Summary      Get requests by cursor
// @Description  Gets 20 requests starting after the cursor position, filtered by status
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param        X-Hotel-ID  header  string                          true   "Hotel UUID"
// @Param        body        body    models.GetRequestsByStatusInput  false  "Cursor position and status filter"
// @Success      200     {object}  map[string]interface{}  "Returns requests array, next_cursor_time, and next_cursor_id"
// @Failure      400     {object}  map[string]string
// @Failure      500     {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/cursor [post]
func (r *RequestsHandler) GetRequestByCursor(c *fiber.Ctx) error {
	var body models.GetRequestsByStatusInput
	if err := c.BodyParser(&body); err != nil {
		return errs.InvalidJSON()
	}
	body.HotelID = c.Get("X-Hotel-ID")
	if err := httpx.Validate(&body); err != nil {
		return err
	}

	var cursorTime time.Time
	if body.CursorTime != nil {
		cursorTime = time.UnixMilli(*body.CursorTime).UTC()
	} else {
		cursorTime = time.UnixMilli(0).UTC()
	}

	cursorID := "00000000-0000-0000-0000-000000000000"
	if body.CursorID != nil {
		cursorID = *body.CursorID
	}

	requests, nextCursorTime, nextCursorID, err := r.RequestRepository.FindRequestsByStatusPaginated(c.Context(), cursorTime, cursorID, body.Status, body.HotelID, defaultPageSize)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("requests", "cursor", body.CursorTime)
		}
		return c.SendStatus(fiber.ErrInternalServerError.Code)
	}

	resp := fiber.Map{"requests": requests}
	if !nextCursorTime.IsZero() {
		resp["next_cursor_time"] = nextCursorTime.UnixMilli()
		resp["next_cursor_id"] = nextCursorID
	}

	return c.JSON(resp)
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
		Name:                    parsed.Name,
		Description:             parsed.Description,
		RoomID:                  parsed.RoomID,
		RequestCategory:         parsed.RequestCategory,
		RequestType:             parsed.RequestType,
		Department:              parsed.Department,
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

	assigned, err := r.RequestRepository.FindMyRequestsByRoomID(c.Context(), input.RoomID, input.HotelID, userID, "", time.Time{}, utils.DefaultPageLimit)
	if err != nil {
		return errs.InternalServerError()
	}

	unassigned, err := r.RequestRepository.FindUnassignedRequestsByRoomID(c.Context(), input.RoomID, input.HotelID, "", time.Time{}, utils.DefaultPageLimit)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(models.RoomRequestsResponse{
		Assigned:   assigned,
		Unassigned: unassigned,
	})
}

// GetRequestsFeed godoc
// @Summary      Get requests feed
// @Description  Returns a paginated list of requests for the hotel, optionally filtered by assigned user
// @Tags         requests
// @Produce      json
// @Param        X-Hotel-ID  header  string  true   "Hotel ID (UUID)"
// @Param        cursor      query   string  false  "Pagination cursor"
// @Param        limit       query   int     false  "Page size (default 20, max 100)"
// @Param        user_id     query   string  false  "Filter by assigned user ID"
// @Param        unassigned  query   bool    false  "If true, return only requests with no assigned user"
// @Param        sort        query   string  false  "Sort order: priority (default), newest, oldest"
// @Success      200  {object}  utils.CursorPage[models.GuestRequest]
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /requests [get]
func (r *RequestsHandler) GetRequestsFeed(c *fiber.Ctx) error {
	hotelID := c.Get("X-Hotel-ID")
	if hotelID == "" {
		return errs.BadRequest("X-Hotel-ID header is required")
	}

	cursor := c.Query("cursor")
	limit := c.QueryInt("limit")
	userID := c.Query("user_id")
	unassigned := c.QueryBool("unassigned")

	feedSort := models.RequestFeedSort(c.Query("sort"))
	if feedSort == "" {
		feedSort = models.SortByPriority
	}
	if !feedSort.IsValid() {
		return errs.BadRequest("invalid sort: must be priority, newest, or oldest")
	}

	cursorID, cursorCreatedAt, cursorPriorityRank, err := parseFeedCursor(cursor, feedSort)
	if err != nil {
		return errs.BadRequest("invalid cursor")
	}

	resolvedLimit := utils.ResolveLimit(limit)
	requests, err := r.RequestRepository.FindRequestsPaginated(
		c.Context(), hotelID, userID, unassigned,
		feedSort, cursorID, cursorCreatedAt, cursorPriorityRank,
		resolvedLimit+1,
	)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(requests, resolvedLimit, func(req *models.GuestRequest) string {
		return buildFeedCursor(req, feedSort)
	})

	return c.JSON(page)
}

// parseFeedCursor decodes a cursor for the requests feed based on the active sort.
// Returns zero values and nil error for an empty cursor (first page).
func parseFeedCursor(cursor string, feedSort models.RequestFeedSort) (id string, createdAt time.Time, priorityRank int, err error) {
	if cursor == "" {
		return "", time.Time{}, 0, nil
	}
	parts := strings.SplitN(cursor, "|", 2)
	if len(parts) != 2 {
		return "", time.Time{}, 0, errors.New("invalid cursor")
	}
	id = parts[1]

	switch feedSort {
	case models.SortByNewest, models.SortByOldest:
		nano, parseErr := strconv.ParseInt(parts[0], 10, 64)
		if parseErr != nil {
			return "", time.Time{}, 0, errors.New("invalid cursor")
		}
		createdAt = time.Unix(0, nano).UTC()
	default: // SortByPriority
		rank, parseErr := strconv.Atoi(parts[0])
		if parseErr != nil {
			return "", time.Time{}, 0, errors.New("invalid cursor")
		}
		priorityRank = rank
	}
	return id, createdAt, priorityRank, nil
}

// buildFeedCursor encodes the cursor for the next page based on the active sort.
func buildFeedCursor(req *models.GuestRequest, feedSort models.RequestFeedSort) string {
	switch feedSort {
	case models.SortByNewest, models.SortByOldest:
		return strconv.FormatInt(req.CreatedAt.UnixNano(), 10) + "|" + req.ID
	default: // SortByPriority
		return strconv.Itoa(priorityRankOf(req.Priority)) + "|" + req.ID
	}
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

// parseRequestCursor splits a "id|request_version" cursor string (used by GetRequestByCursor).
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
