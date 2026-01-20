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

// Mock repository
type mockHotelRepository struct {
	findByIDFunc func(ctx context.Context, id string) (*models.Hotel, error)
}

func (m *mockHotelRepository) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
	return m.findByIDFunc(ctx, id)
}

func TestHotelHandler_GetHotelByID(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with hotel", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				return &models.Hotel{
					ID:     "123e4567-e89b-12d3-a456-426614174000",
					Name:   "Grand Hilton Hotel",
					Floors: 10,
				}, nil
			},
		}

		app := fiber.New()
		h := NewHotelHandler(mock)
		app.Get("/hotels/:id", h.GetHotelByID)

		req := httptest.NewRequest("GET", "/hotels/123e4567-e89b-12d3-a456-426614174000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "Grand Hilton Hotel")
		assert.Contains(t, string(body), "123e4567-e89b-12d3-a456-426614174000")
	})

	t.Run("returns 400 for invalid UUID format", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelHandler(mock)
		app.Get("/hotels/:id", h.GetHotelByID)

		req := httptest.NewRequest("GET", "/hotels/not-a-valid-uuid", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "invalid hotel id format")
	})

	t.Run("returns 404 when hotel not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelHandler(mock)
		app.Get("/hotels/:id", h.GetHotelByID)

		req := httptest.NewRequest("GET", "/hotels/123e4567-e89b-12d3-a456-426614174000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on database error", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				return nil, errors.New("database connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelHandler(mock)
		app.Get("/hotels/:id", h.GetHotelByID)

		req := httptest.NewRequest("GET", "/hotels/123e4567-e89b-12d3-a456-426614174000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestHotelHandler_GetHotelByID_EdgeCases(t *testing.T) {
	t.Parallel()

	mock := &mockHotelRepository{
		findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
			return nil, nil
		},
	}

	app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
	h := NewHotelHandler(mock)
	app.Get("/hotels/:id", h.GetHotelByID)

	tests := []struct {
		name           string
		id             string
		expectedStatus int
	}{
		{"partial UUID", "123e4567", 400},
		{"invalid format", "not-a-uuid", 400},
		{"numbers only", "12345", 400},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := httptest.NewRequest("GET", "/hotels/"+tt.id, nil)
			resp, err := app.Test(req)
			require.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}

func TestHotelHandler_GetHotelByID_InvalidMethods(t *testing.T) {
	t.Parallel()

	mock := &mockHotelRepository{
		findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
			return &models.Hotel{
				ID:     "123e4567-e89b-12d3-a456-426614174000",
				Name:   "Test Hotel",
				Floors: 5,
			}, nil
		},
	}

	app := fiber.New()
	h := NewHotelHandler(mock)
	app.Get("/hotels/:id", h.GetHotelByID)

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

			req := httptest.NewRequest(tt.method, "/hotels/123e4567-e89b-12d3-a456-426614174000", nil)
			resp, err := app.Test(req)
			require.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}