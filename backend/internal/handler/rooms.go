package handler

import (
	"context"
	"strconv"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type RoomsRepository interface {
	FindRoomsWithOptionalGuestBooking(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error)
}

type RoomsHandler struct {
	repo RoomsRepository
}

func NewRoomsHandler(repo RoomsRepository) *RoomsHandler {
	return &RoomsHandler{repo: repo}
}

// GetRooms godoc
// @Summary      Get Rooms
// @Description  Retrieves rooms optionally filtered by floor, with any active guest bookings
// @Tags         rooms
// @Produce      json
// @Param        floors      query     []int   false  "floors"
// @Param        cursor      query     string  false  "Opaque cursor for the next page"
// @Param        limit       query     int     false  "Number of items per page (1-100, default 20)"
// @Success      200         {object}  utils.CursorPage[models.RoomWithOptionalGuestBooking]
// @Failure      400         {object}  map[string]string
// @Failure      500         {object}  map[string]string
// @Router       /rooms [get]
func (h *RoomsHandler) GetRooms(c *fiber.Ctx) error {
	filter := new(models.RoomFilter)
	if err := c.QueryParser(filter); err != nil {
		return errs.BadRequest("invalid filters")
	}

	if _, _, err := utils.DecodeCursorInt(filter.Cursor); err != nil {
		return errs.BadRequest("invalid cursor")
	}

	rooms, err := h.repo.FindRoomsWithOptionalGuestBooking(c.Context(), filter)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(rooms, filter.Limit, func(r *models.RoomWithOptionalGuestBooking) string {
		return strconv.Itoa(r.RoomNumber)
	})

	return c.JSON(page)
}
