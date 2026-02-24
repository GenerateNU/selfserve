package handler

import (
	"context"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type RoomsRepository interface {
	FindRooms(ctx context.Context) ([]models.Room, error)
}

type RoomsHandler struct {
	repo RoomsRepository
}

func NewRoomsHandler(repo RoomsRepository) *RoomsHandler {
	return &RoomsHandler{repo: repo}
}

// FindRooms godoc
// @Summary      Find rooms
// @Description  Finds all rooms
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Success      200   {array}  models.Room
// @Failure      500   {object}  errs.HTTPError  "Internal server error"
func (h *RoomsHandler) GetRooms(c *fiber.Ctx) error {
	rooms, err := h.repo.FindRooms(c.Context())
	if err != nil {
		return errs.InternalServerError()
	}
	return c.JSON(rooms)
}
