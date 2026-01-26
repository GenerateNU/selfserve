package handler

import (
	"errors"
	"log/slog"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)

type RequestsHandler struct {
	RequestRepository storage.RequestsRepository
}

func NewRequestsHandler(repo storage.RequestsRepository) *RequestsHandler {
	return &RequestsHandler{RequestRepository: repo}
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
		slog.Error("Failed to insert request", "error", err.Error())
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
