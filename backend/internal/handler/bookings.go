package handler

import (
	"context"

	"github.com/generate/selfserve/internal/errs"
	"github.com/gofiber/fiber/v2"
)

type GuestBookingsRepository interface {
	FindGroupSizeOptions(ctx context.Context, hotelID string) ([]int, error)
}

type GuestBookingHandler struct {
	repo GuestBookingsRepository
}

func NewGuestBookingsHandler(repo GuestBookingsRepository) *GuestBookingHandler {
	return &GuestBookingHandler{repo: repo}
}

// GetGroupSizeOptions godoc
// @Summary      Get available group size options
// @Description  Retrieves all distinct group sizes across guest bookings
// @Tags         guest-bookings
// @Produce      json
// @Success      200  {object}  []int
// @Failure      500  {object}  map[string]string
// @Router       /guest_bookings/group_sizes [get]
func (h *GuestBookingHandler) GetGroupSizeOptions(c *fiber.Ctx) error {
	hotelID := c.Get("X-Hotel-ID")
	if hotelID == "" {
		return errs.BadRequest("X-Hotel-ID header is required")
	}

	sizes, err := h.repo.FindGroupSizeOptions(c.Context(), hotelID)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(sizes)
}
