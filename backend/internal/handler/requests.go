package handler

import (
	"errors"
	"log/slog"
	"sort"
	"strings"

	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)

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



// GetAllRequests godoc
// @Summary      Get all requests
// @Description  Retrieves a list of all requests
// @Tags         requests
// @Produce      json
// @Success      200   {array}   models.Request
// @Failure      500   {object}  map[string]string
// @Router       /requests [get]
func (r *RequestsHandler) GetAllRequests(c *fiber.Ctx) error {
	requests, err := r.RequestRepository.GetAllRequests(c.Context())
	if err != nil {
		slog.Error("Failed to fetch requests", "error", err.Error())
		return errs.InternalServerError()
	}
	
	return c.Status(fiber.StatusOK).JSON(requests)
}

func validateGenerateRequest(incoming *models.GenerateRequestInput) error {
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
// @Router       /request/generate [post]
func (r *RequestsHandler) GenerateRequest(c *fiber.Ctx) error {
	var incoming models.GenerateRequestInput
	if err := c.BodyParser(&incoming); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateGenerateRequest(&incoming); err != nil {
		return err
	}

	parsed, err := r.GenerateRequestService.RunGenerateRequest(c.Context(), aiflows.GenerateRequestInput{
		RawText: incoming.RawText,
	})
	if err != nil {
		slog.Error("genkit failed to generate a request", "error", err)
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
