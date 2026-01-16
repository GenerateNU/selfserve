package handler

import (
	"context"
	"errors"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Mock repository - allows us to control what the "database" returns in tests
type mockUsersRepository struct {
	getUserByIdFunc func(ctx context.Context, id string) (*models.User, error)
}

// Implement the interface - calls our controllable function
func (m *mockUsersRepository) GetUserById(ctx context.Context, id string) (*models.User, error) {
	return m.getUserByIdFunc(ctx, id)
}

func TestUsersHandler_GetUserByID(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with user", func(t *testing.T) {
		t.Parallel()

		// Create mock that returns a valid user
		mock := &mockUsersRepository{
			getUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
				return &models.User{
					ID:        "550e8400-e29b-41d4-a716-446655440000",
					FirstName: "John",
					LastName:  "Doe",
					Role:      "admin",
				}, nil
			},
		}

		// Create Fiber app and handler
		app := fiber.New()
		h := NewUserHandler(mock)
		app.Get("/users/:id", h.GetUserByID)

		// Make request
		req := httptest.NewRequest("GET", "/users/550e8400-e29b-41d4-a716-446655440000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		// Assert response
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "John")
		assert.Contains(t, string(body), "Doe")
	})

	t.Run("returns 404 when user not found", func(t *testing.T) {
		t.Parallel()

		// Create mock that returns not found error
		mock := &mockUsersRepository{
			getUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		// Create Fiber app with error handler (needed to convert our errors to HTTP responses)
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUserHandler(mock)
		app.Get("/users/:id", h.GetUserByID)

		// Make request
		req := httptest.NewRequest("GET", "/users/nonexistent-id", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		// Assert response
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on database error", func(t *testing.T) {
		t.Parallel()

		// Create mock that returns a database error
		mock := &mockUsersRepository{
			getUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
				return nil, errors.New("database connection failed")
			},
		}

		// Create Fiber app with error handler
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUserHandler(mock)
		app.Get("/users/:id", h.GetUserByID)

		// Make request
		req := httptest.NewRequest("GET", "/users/some-id", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		// Assert response
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestUsersHandler_GetUserByID_InvalidMethods(t *testing.T) {
	t.Parallel()

	mock := &mockUsersRepository{
		getUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
			return &models.User{ID: "123", FirstName: "John"}, nil
		},
	}

	app := fiber.New()
	h := NewUserHandler(mock)
	app.Get("/users/:id", h.GetUserByID)

	tests := []struct {
		name           string
		method         string
		expectedStatus int
	}{
		{"POST not allowed", "POST", 405},
		{"PUT not allowed", "PUT", 405},
		{"DELETE not allowed", "DELETE", 405},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := httptest.NewRequest(tt.method, "/users/123", nil)
			resp, err := app.Test(req)
			require.NoError(t, err)

			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}
