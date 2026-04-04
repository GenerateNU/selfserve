package handler

import (
	"context"
	"errors"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

const clerkUserIDLocalKey = "userId"

// authUserLookup loads the authenticated staff user (Clerk id = users.id) for hotel scoping.
type authUserLookup interface {
	FindUser(ctx context.Context, id string) (*models.User, error)
}

// userIDAndHotelFromAuth resolves tenant and identity from Clerk JWT middleware (Locals userId).
func userIDAndHotelFromAuth(c *fiber.Ctx, users authUserLookup) (userID string, hotelID string, err error) {
	raw := c.Locals(clerkUserIDLocalKey)
	if raw == nil {
		return "", "", errs.Unauthorized()
	}
	clerkID, ok := raw.(string)
	if !ok || strings.TrimSpace(clerkID) == "" {
		return "", "", errs.Unauthorized()
	}
	u, err := users.FindUser(c.Context(), clerkID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return "", "", errs.BadRequest("user is not registered; complete sign-in or run the Clerk user webhook once")
		}
		return "", "", err
	}
	if u.HotelID == nil || strings.TrimSpace(*u.HotelID) == "" {
		return "", "", errs.BadRequest("user has no hotel association")
	}
	return u.ID, *u.HotelID, nil
}
