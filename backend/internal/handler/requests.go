package handler

import (
	"errors"
	"log/slog"
	"sort"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const defaultPageSize = 20

type RequestsHandler struct {
	RequestRepository      storage.RequestsRepository
	GenerateRequestService aiflows.GenerateRequestService
}

func NewRequestsHandler(repo storage.RequestsRepository, generateRequestService aiflows.GenerateRequestService) *RequestsHandler {
	return &RequestsHandler{
		RequestRepository:      repo,
		GenerateRequestService: generateRequestService,
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

	if !validUUID(input.HotelID) {
		errors["hotel_id"] = "invalid uuid"
	}

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

type cursorBody struct {
	CursorTime int64  `json:"cursor_time"`
	CursorID   string `json:"cursor_id"`
	Status     string `json:"status"`
}

// GetRequestByCursor godoc
// @Summary      Get requests by cursor
// @Description  Gets 20 requests starting after the cursor position, filtered by status
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param        X-Hotel-ID  header    string      true   "Hotel UUID"
// @Param        body        body      cursorBody  false  "Cursor position and status filter"
// @Success      200     {object}  map[string]interface{}  "Returns requests array and next_cursor"
// @Failure      400     {object}  map[string]string
// @Failure      500     {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/cursor [post]
func (r *RequestsHandler) GetRequestByCursor(c *fiber.Ctx) error {
	var body cursorBody
	if err := c.BodyParser(&body); err != nil {
		return errs.BadRequest("invalid request body")
	}

	hotelID := c.Get("X-Hotel-ID")
	cursorTime := time.Unix(0, body.CursorTime).UTC()

	if !models.RequestStatus(body.Status).IsValid() {
		return errs.BadRequest("Status must be one of: pending, assigned, in progress, completed")
	}

	if !validUUID(hotelID) {
		return errs.BadRequest("X-Hotel-ID header must be a valid UUID")
	}

	requests, nextCursor, err := r.RequestRepository.FindRequestsByStatusPaginated(c.Context(), cursorTime, body.CursorID, body.Status, hotelID, defaultPageSize)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("requests", "cursor", body.CursorTime)
		}
		return c.SendStatus(fiber.ErrInternalServerError.Code)
	}

	return c.JSON(fiber.Map{
		"requests":    requests,
		"next_cursor": nextCursor,
	})
}

// GenerateRequest godoc
// @Summary      generates a request
// @Description  Generates a request using AI
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param  request  body  models.GenerateRequestInput  true  "Request data with raw text"
// @Success      200   {object}  models.Request
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Security     BearerAuth
// @Router       /request/generate [post]
func (r *RequestsHandler) GenerateRequest(c *fiber.Ctx) error {
	var input models.GenerateRequestInput
	if err := c.BodyParser(&input); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateGenerateRequest(&input); err != nil {
		return err
	}

	parsed, err := r.GenerateRequestService.RunGenerateRequest(c.Context(), aiflows.GenerateRequestInput{
		RawText: input.RawText,
	})
	if err != nil {
		slog.Error("genkit failed to generate a request", "error", err)
		return errs.InternalServerError()
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
		Notes:                   parsed.Notes,
	}}

	res, err := r.RequestRepository.InsertRequest(c.Context(), &req)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}
