package handler

import (
	"errors"
	"log/slog"
	"sort"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/llm"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)

type RequestsHandler struct {
	RequestRepository storage.RequestsRepository
	LLMService        llm.LLMServicer
}

func NewRequestsHandler(repo storage.RequestsRepository, llmSvc llm.LLMServicer) *RequestsHandler {
	return &RequestsHandler{
		RequestRepository: repo,
		LLMService:        llmSvc,
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
// @Router       /request [post]
func (r *RequestsHandler) CreateRequest(c *fiber.Ctx) error {
	var incoming models.MakeRequest
	if err := c.BodyParser(&incoming); err != nil {
		return errs.InvalidJSON()
	}
	req := models.Request{MakeRequest: incoming}

	if err := validateCreateRequest(&req); err != nil {
		return err
	}

	res, err := r.RequestRepository.InsertRequest(c.Context(), &req)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

func validateCreateRequest(req *models.Request) error {
	errors := make(map[string]string)

	if !validUUID(req.HotelID) {
		errors["hotel_id"] = "invalid uuid"
	}

	if req.GuestID != nil && !validUUID(*req.GuestID) {
		errors["guest_id"] = "invalid uuid"
	}
	if req.UserID != nil && !validUUID(*req.UserID) {
		errors["user_id"] = "invalid uuid"
	}
	if req.Name == "" {
		errors["name"] = "must not be an empty string"
	}
	if req.RequestType == "" {
		errors["request_type"] = "must not be an empty string"
	}
	if req.Status == "" {
		errors["status"] = "must not be an empty string"
	}
	if req.Priority == "" {
		errors["priority"] = "must not be an empty string"
	}

	if len(errors) > 0 {
		var parts []string
		for field, violation := range errors {
			parts = append(parts, field+": "+violation)
		}
		return errs.BadRequest(strings.Join(parts, ", "))
	}
	return nil
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
		slog.Error(err.Error())
		return errs.InternalServerError()
	}

	return c.JSON(dev)
}

func validateParseRequest(incoming *models.ParseRequestInput) error {
	errors := make(map[string]string)

	if !validUUID(incoming.HotelID) {
		errors["hotel_id"] = "invalid uuid"
	}

	if incoming.RawText == "" {
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

// ParseRequest godoc
// @Summary      parses natural language text into a structured request
// @Description  Parses natural language text into a structured request using AI and creates it
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param  request  body  models.ParseRequestInput  true  "Request data with raw text"
// @Success      200   {object}  models.Request
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /request/parse [post]
func (r *RequestsHandler) ParseRequest(c *fiber.Ctx) error {
	var incoming models.ParseRequestInput
	if err := c.BodyParser(&incoming); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateParseRequest(&incoming); err != nil {
		return err
	}

	parsed, err := r.LLMService.RunParseRequest(c.Context(), llm.ParseRequestInput{
		RawText: incoming.RawText,
	})
	if err != nil {
		slog.Error("llm parse failed", "error", err)
		return errs.InternalServerError()
	}

	req := models.Request{MakeRequest: models.MakeRequest{
		HotelID:                 incoming.HotelID,
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

	if err := validateCreateRequest(&req); err != nil {
		return err
	}

	res, err := r.RequestRepository.InsertRequest(c.Context(), &req)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}
