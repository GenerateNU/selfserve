package clerk

import (
	"strings"
	jwt "github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/generate/selfserve/internal/errs"
	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if !strings.Contains(authHeader, "Bearer ") {
		return errs.Unauthorized()
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
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