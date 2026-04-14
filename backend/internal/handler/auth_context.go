package handler

import (
	"context"
	"errors"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type authUserLookup interface {
	FindUser(ctx context.Context, id string) (*models.User, error)
}

// userIDAndHotelFromAuth resolves the Clerk subject from JWT locals and loads the user's hotel_id.
func userIDAndHotelFromAuth(c *fiber.Ctx, users authUserLookup) (clerkID, hotelID string, err error) {
	raw := c.Locals("userId")
	clerkID, _ = raw.(string)
	if strings.TrimSpace(clerkID) == "" {
		return "", "", errs.Unauthorized()
	}

	u, ferr := users.FindUser(c.Context(), clerkID)
	if ferr != nil {
		if errors.Is(ferr, errs.ErrNotFoundInDB) {
			return "", "", errs.BadRequest("user is not registered; complete sign-up first")
		}
		return "", "", errs.InternalServerError()
	}

	if strings.TrimSpace(u.HotelID) == "" {
		return "", "", errs.BadRequest("user has no hotel assigned")
	}

	return clerkID, u.HotelID, nil
}
