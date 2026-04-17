package handler

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
)

type RoomsRepository interface {
	FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int, cursorRoomID string) ([]*models.RoomWithOptionalGuestBooking, error)
	FindAllFloors(ctx context.Context, hotelID string) ([]int, error)
	FindRoomByID(ctx context.Context, hotelID string, id string) (*models.RoomWithOptionalGuestBooking, error)
}

type RoomsHandler struct {
	repo RoomsRepository
}

func NewRoomsHandler(repo RoomsRepository) *RoomsHandler {
	return &RoomsHandler{repo: repo}
}

func parseFilterRoomsCursor(cursor string) (roomNumber int, roomID string, err error) {
	if cursor == "" {
		return 0, "", nil
	}

	parts := strings.Split(cursor, ":")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return 0, "", errs.BadRequest("invalid cursor")
	}

	roomNumber, err = strconv.Atoi(parts[0])
	if err != nil {
		return 0, "", errs.BadRequest("invalid cursor")
	}

	return roomNumber, parts[1], nil
}

// FilterRooms godoc
// @Summary      List rooms with filters
// @Description  Retrieves rooms with optional floor filters and cursor pagination, including any active guest bookings
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Param        X-Hotel-ID  header    string                      true   "Hotel ID (UUID)"
// @Param        body        body      models.FilterRoomsRequest   false  "Filters and pagination"
// @Success      200         {object}  utils.CursorPage[models.RoomWithOptionalGuestBooking]
// @Failure      400         {object}  map[string]string
// @Failure      500         {object}  map[string]string
// @Security     BearerAuth
// @Router       /rooms [post]
func (h *RoomsHandler) FilterRooms(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	var body models.FilterRoomsRequest
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return err
	}

	cursorRoomNumber, cursorRoomID, err := parseFilterRoomsCursor(body.Cursor)
	if err != nil {
		return err
	}

	rooms, err := h.repo.FindRoomsWithOptionalGuestBookingsByFloor(c.Context(), &body, hotelID, cursorRoomNumber, cursorRoomID)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(rooms, body.Limit, func(r *models.RoomWithOptionalGuestBooking) string {
		return fmt.Sprintf("%d:%s", r.RoomNumber, r.ID)
	})

	return c.JSON(page)
}

// GetRoomByID godoc
// @Summary      Get room by ID
// @Description  Retrieves a single room by its UUID
// @Tags         rooms
// @Produce      json
// @Param        X-Hotel-ID  header    string  true   "Hotel ID (UUID)"
// @Param        id          path      string  true   "Room ID (UUID)"
// @Success      200  {object}  models.RoomWithOptionalGuestBooking
// @Failure      400  {object}  errs.HTTPError
// @Failure      404  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /rooms/{id} [get]
func (h *RoomsHandler) GetRoomByID(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}

	room, err := h.repo.FindRoomByID(c.Context(), hotelID, id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("room", "id", id)
		}
		return errs.InternalServerError()
	}

	return c.JSON(room)
}

// GetFloors godoc
// @Summary      Get Floors
// @Description  Retrieves all distinct floor numbers
// @Tags         rooms
// @Produce      json
// @Param        X-Hotel-ID  header    string  true   "Hotel ID (UUID)"
// @Success      200  {array}   int
// @Failure      500  {object}  map[string]string
// @Router       /rooms/floors [get]
func (h *RoomsHandler) GetFloors(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	floors, err := h.repo.FindAllFloors(c.Context(), hotelID)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(floors)
}
