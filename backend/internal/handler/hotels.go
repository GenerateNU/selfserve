package handler

import (
	"context"
	"errors"
	"log/slog"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// HotelRepository defines methods for hotel data access
type HotelRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
}

type HotelsRepository interface {
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
}


type HotelHandler struct {
	repo HotelRepository
}

type HotelsHandler struct {
	repo HotelsRepository
}


func NewHotelHandler(repo HotelRepository) *HotelHandler {
	return &HotelHandler{repo: repo}
}

func NewHotelsHandler(repo HotelsRepository) *HotelsHandler {
	return &HotelsHandler{repo: repo}
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
// @Router       /hotel [post]
func (h *HotelsHandler) CreateHotel(c *fiber.Ctx) error {
	var hotelRequest models.CreateHotelRequest
	
	if err := c.BodyParser(&hotelRequest); err != nil {
		return errs.InvalidJSON()
	}
	
	// Validate required fields
	if hotelRequest.Name == "" {
		return errs.BadRequest("hotel name is required")
	}

	if hotelRequest.Floors <= 0 {
		return errs.BadRequest("hotel floors must be greater than 0")
	}
	
	createdHotel, err := h.repo.InsertHotel(c.Context(), &hotelRequest)
	if err != nil {
		slog.Error("failed to create hotel", "error", err.Error())
		return errs.InternalServerError()
	}
	
	return c.Status(fiber.StatusCreated).JSON(createdHotel)
}