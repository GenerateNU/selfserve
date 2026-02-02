package handler

import (
	"errors"
	"log/slog"
	"sort"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
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
	if err := c.BodyParser(&CreateGuestRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateCreateGuest(&CreateGuestRequest); err != nil {
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

func validateCreateGuest(guest *models.CreateGuest) error {
	errors := make(map[string]string)

	if strings.TrimSpace(guest.FirstName) == "" {
		errors["first_name"] = "must not be an empty string"
	}

	if strings.TrimSpace(guest.LastName) == "" {
		errors["last_name"] = "must not be an empty string"
	}

	if guest.Timezone != nil {
		if _, err := time.LoadLocation(*guest.Timezone); err != nil {
			errors["timezone"] = "invalid IANA timezone"
		}
	}

	// Aggregates errors deterministically
	if len(errors) > 0 {
		var keys []string
		for k := range errors {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		var parts []string
		for _, k := range keys {
			parts = append(parts, k+": "+errors[k])
		}
		return errs.BadRequest(strings.Join(parts, ", "))
	}

	return nil
}
