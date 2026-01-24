package handler

import (
	"sort"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
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
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /guests [post]
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
		return errs.InternalServerError()
	}

	return c.JSON(res)
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
