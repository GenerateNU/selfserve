package handler

import (
	"context"
	"strconv"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type RoomsRepository interface {
	FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error)
	FindAllFloors(ctx context.Context, hotelID string) ([]int, error)
}

type RoomsHandler struct {
	repo  RoomsRepository
	users authUserLookup
}

func NewRoomsHandler(repo RoomsRepository, users authUserLookup) *RoomsHandler {
	return &RoomsHandler{repo: repo, users: users}
}

// FilterRooms godoc
// @Summary      List rooms with filters
// @Description  Retrieves rooms with optional floor filters and cursor pagination, including any active guest bookings
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Param        body        body      models.FilterRoomsRequest   false  "Filters and pagination"
// @Success      200         {object}  utils.CursorPage[models.RoomWithOptionalGuestBooking]
// @Failure      400         {object}  map[string]string
// @Failure      500         {object}  map[string]string
// @Security     BearerAuth
// @Router       /rooms [post]
func (h *RoomsHandler) FilterRooms(c *fiber.Ctx) error {
	_, hotelID, err := userIDAndHotelFromAuth(c, h.users)
	if err != nil {
		return err
	}

	var body models.FilterRoomsRequest
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return err
	}

	cursorRoomNumber := 0
	if body.Cursor != "" {
		cursorRoomNumber, err = strconv.Atoi(body.Cursor)
		if err != nil {
			return errs.BadRequest("invalid cursor")
		}
	}

	rooms, err := h.repo.FindRoomsWithOptionalGuestBookingsByFloor(c.Context(), &body, hotelID, cursorRoomNumber)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(rooms, body.Limit, func(r *models.RoomWithOptionalGuestBooking) string {
		return strconv.Itoa(r.RoomNumber)
	})

	return c.JSON(page)
}

// GetFloors godoc
// @Summary      Get Floors
// @Description  Retrieves all distinct floor numbers
// @Tags         rooms
// @Produce      json
// @Success      200  {array}   int
// @Failure      500  {object}  map[string]string
// @Router       /rooms/floors [get]
func (h *RoomsHandler) GetFloors(c *fiber.Ctx) error {
	_, hotelID, err := userIDAndHotelFromAuth(c, h.users)
	if err != nil {
		return err
	}

	floors, err := h.repo.FindAllFloors(c.Context(), hotelID)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(floors)
}
