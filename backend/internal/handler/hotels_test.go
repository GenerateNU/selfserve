package handler

import (
	"context"
	"bytes"
	"errors"
	"io"
	"net/http/httptest"
	"testing"
	"time"

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


type mockHotelsRepository struct {
	insertHotelFunc func(ctx context.Context, req *models.CreateHotelRequest) (*models.Hotel, error)
}

func (m *mockHotelsRepository) InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	return m.insertHotelFunc(ctx, hotel)
}


func TestHotelHandler_GetHotelByID(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 on success", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				return &models.Hotel{
					ID: id,
					CreateHotelRequest: models.CreateHotelRequest{
						Name:   "Test Hotel",
						Floors: 10,
					},
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
	})

	t.Run("returns 400 on invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelHandler(mock)
		app.Get("/hotels/:id", h.GetHotelByID)

		req := httptest.NewRequest("GET", "/hotels/invalid-uuid", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
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
}


func TestHotelsHandler_CreateHotel(t *testing.T) {
	t.Parallel()
	validBody := `{
		"name": "The Grand Budapest Hotel",
		"floors": 10
	}`

	t.Run("returns 201 on success", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					ID: "generated-uuid",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}

		app := fiber.New()
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 201, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "generated-uuid")
		assert.Contains(t, string(body), "The Grand Budapest Hotel")
		assert.Contains(t, string(body), "10")
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					ID: "generated-uuid",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(`{invalid json`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on missing required name field", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					ID: "generated-uuid",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		missingNameBody := `{
			"floors": 10
		}`

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(missingNameBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "name")
	})

	t.Run("returns 400 on empty name field", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					ID: "generated-uuid",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		emptyNameBody := `{
			"name": "",
			"floors": 10
		}`

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(emptyNameBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "name")
	})

	t.Run("returns 400 on missing required floors field", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					ID: "generated-uuid",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		missingFloorsBody := `{
			"name": "The Grand Budapest Hotel"
		}`

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(missingFloorsBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "floors")
	})

	t.Run("returns 400 on floors equal to 0", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					ID: "generated-uuid",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		zeroFloorsBody := `{
			"name": "The Grand Budapest Hotel",
			"floors": 0
		}`

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(zeroFloorsBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "floors")
	})

	t.Run("returns 400 on negative floors", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					ID: "generated-uuid",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		negativeFloorsBody := `{
			"name": "The Grand Budapest Hotel",
			"floors": -1
		}`

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(negativeFloorsBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "floors")
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock)
		app.Post("/hotel", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotel", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
