package clerk

import (
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	jwt "github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/generate/selfserve/internal/errs"
	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware(c *fiber.Ctx) error {
	clerk.SetKey("MUST BE IN THE ENV")

	authHeader := c.Get("Authorization")
	if !strings.Contains(authHeader, "Bearer ") {
		return errs.Unauthorized()
	}

	token := strings.TrimPrefix("Bearer ", authHeader)
	claims, err := jwt.Verify(c.Context(), &jwt.VerifyParams{
		Token: token,
	})

	if err != nil {
		return errs.Unauthorized()
	}

	userId := claims.Subject
	c.Locals("userId", userId)
	c.Next()
	return nil
}