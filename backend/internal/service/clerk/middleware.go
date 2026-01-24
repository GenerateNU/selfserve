package clerk

import (
	"context"
	"strings"

	jwt "github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/generate/selfserve/internal/errs"
	"github.com/gofiber/fiber/v2"
)

func NewAuthMiddleware(verifier JWTVerifier) fiber.Handler {
	 return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if !strings.Contains(authHeader, "Bearer ") {
			return errs.Unauthorized()
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		clerkId, err := verifier.Verify(c.Context(), token)

		if err != nil {
			return errs.Unauthorized()
		}

		c.Locals("userId", clerkId)
		if err := c.Next(); err != nil {
    		return err
		}
		return nil
	}
}

type JWTVerifier interface {
	Verify(ctx context.Context, token string) (string, error)
}

type ClerkJWTVerifier struct{}

func NewClerkJWTVerifier() *ClerkJWTVerifier {
	return &ClerkJWTVerifier{}
}


func (v *ClerkJWTVerifier) Verify(ctx context.Context, token string) (string, error) {
	claims, err := jwt.Verify(ctx, &jwt.VerifyParams{
		Token: token,
	})
	if err != nil {
		return "", err
	}
	return claims.Subject, nil
}