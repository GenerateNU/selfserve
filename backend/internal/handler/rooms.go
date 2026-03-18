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
	FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.RoomFilters, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error)
}

type RoomsHandler struct {
	repo RoomsRepository
}

func NewRoomsHandler(repo RoomsRepository) *RoomsHandler {
	return &RoomsHandler{repo: repo}
}

// GetRoomsByFloor godoc
// @Summary      Get Rooms By Floor
// @Description  Retrieves rooms optionally filtered by floor, with any active guest bookings
// @Tags         rooms
// @Produce      json
// @Param        X-Hotel-ID  header    string  true   "Hotel ID (UUID)"
// @Param        floors      query     []int   false  "floors"
// @Param        cursor      query     string  false  "Opaque cursor for the next page"
// @Param        limit       query     int     false  "Number of items per page (1-100, default 20)"
// @Success      200         {object}  utils.CursorPage[models.RoomWithOptionalGuestBooking]
// @Failure      400         {object}  map[string]string
// @Failure      500         {object}  map[string]string
// @Router       /rooms [get]
func (h *RoomsHandler) GetRoomsByFloor(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	filter := new(models.RoomFilters)
	if err := c.QueryParser(filter); err != nil {
		return errs.BadRequest("invalid filters")
	}

	cursor := c.Query("cursor", "")
	cursorRoomNumber := 0
	if cursor != "" {
		cursorRoomNumber, err = strconv.Atoi(cursor)
		if err != nil {
			return errs.BadRequest("invalid cursor")
		}
	}

	rooms, err := h.repo.FindRoomsWithOptionalGuestBookingsByFloor(c.Context(), filter, hotelID, cursorRoomNumber)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(rooms, filter.Limit, func(r *models.RoomWithOptionalGuestBooking) string {
		return strconv.Itoa(r.RoomNumber)
	})

	return c.JSON(page)
}
