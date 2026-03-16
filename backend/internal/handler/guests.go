package handler

import (
	"errors"
	"log/slog"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type GuestsHandler struct {
	GuestsRepository storage.GuestsRepository
}

func NewGuestsHandler(repo storage.GuestsRepository) *GuestsHandler {
	return &GuestsHandler{GuestsRepository: repo}
}

// CreateGuest godoc
// @Summary      Creates a guest
// @Description  Creates a guest with the given data
// @Tags         guests
// @Accept       json
// @Produce      json
// @Param        request  body   models.CreateGuest  true  "Guest data"
// @Success      200   {object}  models.Guest
// @Failure      400   {object}  map[string]string "Invalid guest body format"
// @Failure      500   {object}  map[string]string  "Internal server error"
// @Router       /api/v1/guests [post]
func (h *GuestsHandler) CreateGuest(c *fiber.Ctx) error {
	var CreateGuestRequest models.CreateGuest
	if err := httpx.BindAndValidate(c, &CreateGuestRequest); err != nil {
		return err
	}

	res, err := h.GuestsRepository.InsertGuest(c.Context(), &CreateGuestRequest)
	if err != nil {
		if errors.Is(err, errs.ErrAlreadyExistsInDB) {
			return errs.Conflict("guest", "id", "generated")
		}
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

// GetGuest godoc
// @Summary      Gets a guest
// @Description  Retrieves a single guest given an id
// @Tags         guests
// @Accept       json
// @Produce      json
// @Param        id  path   string  true  "Guest ID (UUID)"
// @Success      200   {object}  models.Guest
// @Failure      400   {object}  map[string]string "Invalid guest ID format"
// @Failure      404  {object}  errs.HTTPError  "Guest not found"
// @Failure      500   {object}  map[string]string "Internal server error"
// @Router       /api/v1/guests/{id} [get]
func (h *GuestsHandler) GetGuest(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := uuid.Parse(id)
	if err != nil {
		return errs.BadRequest("guest id is not a valid UUID")
	}

	guest, err := h.GuestsRepository.FindGuest(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("guest", "id", id)
		}
		slog.Error("failed to get guest", "id", id, "error", err)
		return errs.InternalServerError()
	}

	return c.JSON(guest)
}


// GetGuest godoc
// @Summary      Gets a guest with previous stays 
// @Description  Retrieves a single guest with previous stays given an id
// @Tags         guests
// @Accept       json
// @Produce      json
// @Param        id  path   string  true  "Guest ID (UUID)"
// @Success      200   {object}  models.GuestWithStays
// @Failure      400   {object}  map[string]string "Invalid guest ID format"
// @Failure      404  {object}  errs.HTTPError  "Guest not found"
// @Failure      500   {object}  map[string]string "Internal server error"
// @Router       /api/v1/guests/stays/{id} [get]
func (h *GuestsHandler) GetGuestWithStays(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := uuid.Parse(id)
	if err != nil {
		return errs.BadRequest("guest id is not a valid UUID")
	}

	guest, err := h.GuestsRepository.FindGuestWithStays(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("guest", "id", id)
		}
		slog.Error("failed to get guest", "id", id, "error", err)
		return errs.InternalServerError()
	}

	return c.JSON(guest)
}


// UpdateGuest godoc
// @Summary      Updates a guest
// @Description  Updates fields on a guest
// @Tags         guests
// @Accept       json
// @Produce      json
// @Param        id  path   string  true  "Guest ID (UUID)"
// @Param        request  body  models.UpdateGuest  true  "Guest update data"
// @Success      200   {object}  models.Guest
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /api/v1/guests/{id} [put]
func (h *GuestsHandler) UpdateGuest(c *fiber.Ctx) error {
	id := c.Params("id")

	if _, err := uuid.Parse(id); err != nil {
		return errs.BadRequest("guest id is not a valid UUID")
	}

	var update models.UpdateGuest
	if err := httpx.BindAndValidate(c, &update); err != nil {
		return err
	}

	guest, err := h.GuestsRepository.UpdateGuest(c.Context(), id, &update)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("guest", "id", id)
		}

		slog.Error(
			"failed to update guest",
			"id", id,
			"error", err,
		)

		return errs.InternalServerError()
	}

	return c.JSON(guest)
}


// GetGuests godoc
// @Summary      Get Guests
// @Description  Retrieves guests optionally filtered by floor in which they are staying
// @Tags         guests
// @Produce      json
// @Param        X-Hotel-ID  header    string  true   "Hotel ID (UUID)"
// @Param        number      query     string  false  "Floor"
// @Success      200         {object}  []models.GuestWithBooking
// @Failure      400         {object}  map[string]string
// @Failure      500         {object}  map[string]string
// @Router       /api/v1/guests [get]
func (h *GuestsHandler) GetGuests(c *fiber.Ctx) error {
	hotelID := c.Get("X-Hotel-ID")
	if !validUUID(hotelID) {
		return errs.BadRequest("invalid hotel id")
	}

	filter := new(models.GuestFilter)
	filter.HotelID = hotelID
	if err := c.QueryParser(filter); err != nil {
		return errs.BadRequest("invalid filters")
	}

	guests, err := h.GuestsRepository.FindGuests(c.Context(), filter)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(guests)
}