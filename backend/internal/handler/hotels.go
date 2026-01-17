package handler

import (
	"context"
	"errors"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

//Interface for hotel repository -> used in testing later
type HotelRepository interface {
	GetByID(ctx context.Context, id string) (*models.Hotel, error)
}

type HotelHandler struct {
	repo HotelRepository
}

func NewHotelHandler(repo HotelRepository) *HotelHandler {
	return &HotelHandler{repo: repo}
}

func (h *HotelHandler) GetHotelByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	
	//validate the UUID format -> return 400 for invalid
	_, err := uuid.Parse(idParam)
	if err != nil {
		return errs.BadRequest("invalid hotel id format")
	}
	
	//fetch hotel
	hotel, err := h.repo.GetByID(c.Context(), idParam)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("hotel", "id", idParam)
		}
		return errs.InternalServerError()
	}
	
	return c.Status(fiber.StatusOK).JSON(hotel)
}