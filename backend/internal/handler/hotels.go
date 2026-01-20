package handler

import (
	"context"
	"errors"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// HotelRepository defines methods for hotel data access
type HotelRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
}

type HotelHandler struct {
	repo HotelRepository
}

func NewHotelHandler(repo HotelRepository) *HotelHandler {
	return &HotelHandler{repo: repo}
}

// GetHotelByID retrieves a single hotel by its ID
// @Summary      Get hotel by ID
// @Description  Retrieve a hotel's details using its UUID
// @Tags         hotels
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  models.Hotel
// @Failure      400  {object}  errs.HTTPError  "Invalid hotel ID format"
// @Failure      404  {object}  errs.HTTPError  "Hotel not found"
// @Failure      500  {object}  errs.HTTPError  "Internal server error"
// @Router       /api/v1/hotels/{id} [get]
func (h *HotelHandler) GetHotelByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	
	// Validate UUID
	_, err := uuid.Parse(idParam)
	if err != nil {
		return errs.BadRequest("invalid hotel id format")
	}
	
	// Fetch hotel
	hotel, err := h.repo.FindByID(c.Context(), idParam)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("hotel", "id", idParam)
		}
		return errs.InternalServerError()
	}
	
	return c.Status(fiber.StatusOK).JSON(hotel)
}