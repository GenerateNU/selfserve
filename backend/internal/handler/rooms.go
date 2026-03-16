package handler

import (
	"context"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type RoomsRepository interface {
	FindRooms(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithBooking, error)
}

type RoomsHandler struct {
	repo RoomsRepository
}

func NewRoomsHandler(repo RoomsRepository) *RoomsHandler {
	return &RoomsHandler{repo: repo}
}

// GetRooms godoc
// @Summary      Get Rooms
// @Description  Retrieves rooms optionally filtered by floor
// @Tags         rooms
// @Produce      json
// @Param        number  query     string  false  "floor"
// @Success      200     {object}  []models.RoomWithBooking
// @Failure      400     {object}  map[string]string
// @Failure      500     {object}  map[string]string
// @Router       /rooms [get]
func (h *RoomsHandler) GetRooms(c *fiber.Ctx) error {
	filter := new(models.RoomFilter)
	if err := c.QueryParser(filter); err != nil {
		return errs.BadRequest("invalid filters")
	}

	rooms, err := h.repo.FindRooms(c.Context(), filter)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(rooms)
}
