package handler

import (
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)

type HotelsHandler struct {
	HotelsRepository storage.HotelsRepository
}

func NewHotelsHandler(repo storage.HotelsRepository) *HotelsHandler {
	return &HotelsHandler{HotelsRepository: repo}
}

// CreateHotel godoc
// @Summary      creates a hotel
// @Description  Creates a hotel with the given data
// @Tags         hotel
// @Accept       json
// @Produce      json
// @Param  hotel  body  models.CreateHotelRequest  true  "Hotel data"
// @Success      200   {object}  models.Hotel
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /hotel [post]
func (r *HotelsHandler) CreateHotel(c *fiber.Ctx) error {
	var CreateHotelRequest models.CreateHotelRequest
	if err := c.BodyParser(&CreateHotelRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateCreateHotel(&CreateHotelRequest); err != nil {
		return err
	}

	res, err := r.HotelsRepository.InsertHotel(c.Context(), &CreateHotelRequest)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

func validateCreateHotel(hotel *models.CreateHotelRequest) error {
	errors := make(map[string]string)

	if strings.TrimSpace(hotel.Name) == "" {
		errors["name"] = "must not be an empty string"
	}
	if hotel.Floors <= 0 {
		errors["floors"] = "must be greater than 0"
	}

	if len(errors) > 0 {
		var parts []string
		for field, violation := range errors {
			parts = append(parts, field+": "+violation)
		}
		return errs.BadRequest(strings.Join(parts, ", "))
	}
	return nil
}
