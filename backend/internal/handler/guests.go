package handler

import (
	"errors"
	"log/slog"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/generate/selfserve/internal/utils"
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

// SearchGuests godoc
// @Summary      Search guests
// @Description  Searches active guests with optional floors, group size range, and text search filters
// @Tags         guests
// @Accept       json
// @Produce      json
// @Param        X-Hotel-ID  header    string                    true   "Hotel ID (UUID)"
// @Param        request     body      models.GuestSearchFilter  false  "Search filters"
// @Success      200         {object}  utils.CursorPage[models.GuestListItem]
// @Failure      400         {object}  map[string]string
// @Failure      500         {object}  map[string]string
// @Router       /api/v1/guests/search [post]
func (h *GuestsHandler) SearchGuests(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	filter := new(models.GuestSearchFilter)
	if err := c.BodyParser(filter); err != nil {
		return errs.InvalidJSON()
	}

	if filter.GroupSizeMin != nil && filter.GroupSizeMax != nil && *filter.GroupSizeMin > *filter.GroupSizeMax {
		return errs.BadRequest("group_size_min must be less than or equal to group_size_max")
	}

	if filter.Cursor != nil {
		cursor := strings.TrimSpace(*filter.Cursor)
		if cursor != "" {
			if _, err := uuid.Parse(cursor); err != nil {
				return errs.BadRequest("cursor must be a valid UUID")
			}
		}
	}

	guests, err := h.GuestsRepository.FindGuestWithActiveBooking(c.Context(), hotelID, filter)
	if err != nil {
		slog.Error("failed to search guests", "hotel_id", hotelID, "error", err)
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(guests, filter.Limit, func(g *models.GuestListItem) string {
		return g.GuestID
	})

	return c.JSON(page)
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
