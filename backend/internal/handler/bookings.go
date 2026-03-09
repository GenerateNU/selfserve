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

// GetBookingByFloor godoc
// @Summary      Get guest Bookings By Floor
// @Description  Retrieves multiple guest bookings whose booked rooms are in the provided floors array
// @Tags         guest-bookings
// @Produce      json
// @Param        floors  query     string  true  "Comma-separated floor numbers"
// @Success      200       {object}  []models.GuestBooking
// @Failure      400       {object}  map[string]string
// @Failure      500       {object}  map[string]string
// @Router       /guest_bookings/floor [get]
func (h *GuestBookingHandler) GetBookingByFloor(c *fiber.Ctx) error {
	floors, err := getQueryFloors(c)
	if err != nil {
		return err
	}

	bookings, err := h.repo.FindBookingByFloor(c.Context(), floors)

	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(bookings)
}


func getQueryFloors(c *fiber.Ctx) ([]int, error) {
	parts := strings.Split(c.Query("floors"), ",")
	floors := make([]int, len(parts))
    for i, p := range parts {
    floor, err := strconv.Atoi(strings.TrimSpace(p))
    if err != nil {
        return nil, errs.BadRequest("Floors must be an array of integers")
    }
    floors[i] = floor
	}
	return floors, nil
}

