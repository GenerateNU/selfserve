package handler

import (
	"strings"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type RequestHandler struct {
	RequestRepository storage.RequestRepository
}

func NewRequestHandler(repo storage.RequestRepository) *RequestHandler {
	return &RequestHandler{RequestRepository: repo}
}

// MakeRequest godoc
// @Summary      Make a request
// @Description  Creates a request with the given data
// @Tags         requests
// @Accept       json
// @Produce      json
// @Param  request  body  models.MakeRequest  true  "Request data"
// @Success      200   {object}  models.Request
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /request [post]
func (r *RequestHandler)MakeRequest(c *fiber.Ctx) error {
	var incoming models.MakeRequest
	if err := c.BodyParser(&incoming); err != nil {
		return errs.InvalidJSON()
	}
	req := models.Request{MakeRequest: incoming}

	if err := validateRequest(&req); err != nil {
		return err
	}

	res, err := r.RequestRepository.MakeRequest(c.Context(), &req)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

func validateRequest(req *models.Request) error {
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
	if req.Notes == "" {
		errors["notes"] = "must not be an empty string"
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

func validUUID(s string) bool {
	_, err := uuid.Parse(s)
	return err == nil
}