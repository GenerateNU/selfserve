package handler

import (
	"context"
	"strconv"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type GuestBookingsRepository interface {
	FindBookingByFloor(ctx context.Context, floors []int) ([]*models.GuestBooking, error)
}

type GuestBookingHandler struct {
	repo GuestBookingsRepository
}

func NewGuestBookingsHandler(repo GuestBookingsRepository) *GuestBookingHandler {
	return &GuestBookingHandler{repo: repo}
}

// GetMember godoc
// @Summary      Get developer member
// @Description  Retrieves a developer member by name
// @Tags         devs
// @Accept       json
// @Produce      json
// @Param        name  path      string  true  "Developer name"
// @Success      200   {object}  models.Dev
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /devs/{name} [get]
func (h *GuestBookingHandler) FindBookingByFloor(c *fiber.Ctx) error {
	ids, err := getQueryIDs(c)
	if err != nil {
		return err
	}

	bookings, err := h.repo.FindBookingByFloor(c.Context(), ids)

	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(bookings)
}


func getQueryIDs(c *fiber.Ctx) ([]int, error) {
	parts := strings.Split(c.Query("ids"), ",")
	ids := make([]int, len(parts))
    for i, p := range parts {
    id, err := strconv.Atoi(strings.TrimSpace(p))
    if err != nil {
        return nil, errs.BadRequest("Ids must be an array of integers")
    }
    ids[i] = id
	}
	return ids, nil
}

