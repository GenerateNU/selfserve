package clerk

import (
	"context"
	"log"
	"strings"

	jwt "github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/generate/selfserve/internal/errs"
	"github.com/gofiber/fiber/v2"
)

func NewAuthMiddleware(verifier JWTVerifier) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if !strings.Contains(authHeader, "Bearer ") {
			log.Printf("[AUTH] No Bearer token. Header: %q", authHeader)
			return errs.Unauthorized()
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		clerkId, err := verifier.Verify(c.Context(), token)
		if err != nil {
			log.Printf("[AUTH] JWT verify failed: %v", err)
			return errs.Unauthorized()
		}

		log.Printf("[AUTH] Verified user: %s", clerkId)
		c.Locals("userId", clerkId)
		return c.Next()
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
