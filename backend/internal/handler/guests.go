package handler

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type GuestsHandler struct {
	GuestsRepository storage.GuestsRepository
	searchGuests     func(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error)
}

func NewGuestsHandler(repo storage.GuestsRepository, searchRepo storage.GuestsSearchRepository) *GuestsHandler {
	// TODO: once OpenSearch setup is complete —
	// 1. enforce searchRepo as required (fail startup if nil)
	// 2. remove the Postgres fallback below
	search := repo.FindGuestsWithActiveBooking
	if searchRepo != nil {
		search = searchRepo.SearchGuests
	}
	return &GuestsHandler{GuestsRepository: repo, searchGuests: search}
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
// @Security     BearerAuth
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
// @Security     BearerAuth
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
// @Security     BearerAuth
// @Router       /guests/stays/{id} [get]
func (h *GuestsHandler) GetGuestWithStays(c *fiber.Ctx) error {
	id := c.Params("id")
	if !validUUID(id) {
		return errs.BadRequest("guest id is not a valid UUID")
	}

	guest, err := h.GuestsRepository.FindGuestWithStayHistory(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("guest", "id", id)

		}
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
// @Security     BearerAuth
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
// @Description  Retrieves guests optionally filtered by floor
// @Tags         guests
// @Accept       json
// @Produce      json
// @Param        X-Hotel-ID  header    string             true   "Hotel ID (UUID)"
// @Param        body        body      models.GuestFilters true   "Guest filters"
// @Success      200         {object}  models.GuestPage
// @Failure      400         {object}  map[string]string
// @Failure      500         {object}  map[string]string
// @Security     BearerAuth
// @Router       /api/v1/guests [post]
func (h *GuestsHandler) GetGuests(c *fiber.Ctx) error {
	hotelID := c.Get("X-Hotel-ID")
	var filters models.GuestFilters
	filters.HotelID = hotelID
	if err := httpx.BindAndValidate(c, &filters); err != nil {
		return err
	}

	if len(filters.Floors) == 0 {
		filters.Floors = nil
	}
	if len(filters.GroupSize) == 0 {
		filters.GroupSize = nil
	}
	if len(filters.Status) == 0 {
		filters.Status = nil
	}
	if len(filters.Assistance) == 0 {
		filters.Assistance = nil
	}

	if filters.Cursor != "" {
		parts := strings.SplitN(filters.Cursor, "|", 2)
		if len(parts) != 2 {
			return errs.BadRequest("invalid cursor")
		}
		if _, err := uuid.Parse(parts[1]); err != nil {
			return errs.BadRequest("invalid cursor")
		}
		filters.CursorName = parts[0]
		filters.CursorID = parts[1]
	}

	guests, err := h.searchGuests(c.Context(), &filters)
	if err != nil {
		slog.Error("failed to get guests", "error", err)
		return errs.InternalServerError()
	}

	return c.JSON(guests)
}
