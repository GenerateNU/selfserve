package handler

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

// HotelRepository defines methods for hotel data access
type HotelsRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}

type HotelsHandler struct {
	repo      HotelsRepository
	usersRepo HotelUsersRepository
}

func NewHotelsHandler(repo HotelsRepository, usersRepo HotelUsersRepository) *HotelsHandler {
	return &HotelsHandler{repo: repo, usersRepo: usersRepo}
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
// @Security     BearerAuth
// @Router       /api/v1/hotels/{id} [get]
func (h *HotelsHandler) GetHotelByID(c *fiber.Ctx) error {
	idParam := c.Params("id")

	if strings.TrimSpace(idParam) == "" {
		return errs.BadRequest("hotel id is required")
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

// GetHotelUsers godoc
// @Summary      Get users by hotel
// @Description  Returns a paginated list of all users for a hotel
// @Tags         hotels
// @Produce      json
// @Param        id      path      string  true   "Hotel ID"
// @Param        cursor  query     string  false  "Pagination cursor (last seen user ID)"
// @Success      200     {object}  map[string]interface{}
// @Failure      400     {object}  errs.HTTPError
// @Failure      500     {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /hotels/{id}/users [get]
func (h *HotelsHandler) GetHotelUsers(c *fiber.Ctx) error {
	hotelID := c.Params("id")
	if strings.TrimSpace(hotelID) == "" {
		return errs.BadRequest("hotel id is required")
	}
	cursor := c.Query("cursor")

	const pageSize = 20
	users, nextCursor, err := h.usersRepo.GetUsersByHotel(c.Context(), hotelID, cursor, pageSize)
	if err != nil {
		slog.Error("failed to get hotel users", "hotel_id", hotelID, "err", err)
		slog.Error(err.Error())
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"users":       users,
		"next_cursor": nextCursor,
	})
}

// CreateHotel creates a new hotel
// @Summary      Create hotel
// @Description  Create a new hotel with the given data
// @Tags         hotels
// @Accept       json
// @Produce      json
// @Param        hotel  body      models.Hotel  true  "Hotel data"
// @Success      201    {object}  models.Hotel
// @Failure      400    {object}  map[string]string
// @Failure      500    {object}  map[string]string
// @Security     BearerAuth
// @Router       /api/v1/hotels [post]
func (h *HotelsHandler) CreateHotel(c *fiber.Ctx) error {
	var hotelRequest models.CreateHotelRequest

	if err := c.BodyParser(&hotelRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := httpx.BindAndValidate(c, &hotelRequest); err != nil {
		return err
	}

	createdHotel, err := h.repo.InsertHotel(c.Context(), &hotelRequest)
	if err != nil {
		slog.Error("failed to create hotel", "error", err.Error())
		return errs.InternalServerError()
	}

	return c.Status(fiber.StatusCreated).JSON(createdHotel)
}
