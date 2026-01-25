package tests

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/service/clerk"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockJWTVerifier struct {
	verifyFunc func(token string) (string, error)
}

func (m *mockJWTVerifier) Verify(c context.Context, token string) (string, error) {
	return m.verifyFunc(token)
}

func TestAuthMiddleware(t *testing.T) {
	t.Parallel()

	t.Run("returns 401 when Authorization header is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockJWTVerifier{
			verifyFunc: func(token string) (string, error) {
				return "", nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		app.Use(clerk.NewAuthMiddleware(mock))
		app.Get("/protected", func(c *fiber.Ctx) error {
			return c.SendStatus(200)
		})

		req := httptest.NewRequest("GET", "/protected", nil)

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 401 when Authorization header has no Bearer prefix", func(t *testing.T) {
		t.Parallel()

		mock := &mockJWTVerifier{
			verifyFunc: func(token string) (string, error) {
				return "", nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		app.Use(clerk.NewAuthMiddleware(mock))
		app.Get("/protected", func(c *fiber.Ctx) error {
			return c.SendStatus(200)
		})

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "token")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 401 when token verification fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockJWTVerifier{
			verifyFunc: func(token string) (string, error) {
				return "", errors.New("invalid token")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		app.Use(clerk.NewAuthMiddleware(mock))
		app.Get("/protected", func(c *fiber.Ctx) error {
			return c.SendStatus(200)
		})

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid-token")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("calls next and sets userId when token is valid", func(t *testing.T) {
		t.Parallel()

		mock := &mockJWTVerifier{
			verifyFunc: func(token string) (string, error) {
				return "user_123", nil
			},
		}

		var capturedUserId string

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		app.Use(clerk.NewAuthMiddleware(mock))
		app.Get("/protected", func(c *fiber.Ctx) error {
			capturedUserId = c.Locals("userId").(string)
			return c.SendStatus(200)
		})

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer valid-token")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		assert.Equal(t, "user_123", capturedUserId)
	})

	t.Run("extracts token correctly from Bearer header", func(t *testing.T) {
		t.Parallel()

		var capturedToken string

		mock := &mockJWTVerifier{
			verifyFunc: func(token string) (string, error) {
				capturedToken = token
				return "user_123", nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		app.Use(clerk.NewAuthMiddleware(mock))
		app.Get("/protected", func(c *fiber.Ctx) error {
			return c.SendStatus(200)
		})

		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer jwt")

		_, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, "jwt", capturedToken)
	})
}