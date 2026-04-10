package handler

import (
	"bytes"
	"context"
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

type mockHotelsRepository struct {
	findByIDFunc               func(ctx context.Context, id string) (*models.Hotel, error)
	insertHotelFunc            func(ctx context.Context, req *models.CreateHotelRequest) (*models.Hotel, error)
	getDepartmentsByHotelIDFunc func(ctx context.Context, hotelID string) ([]*models.Department, error)
}

func (m *mockHotelsRepository) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
	return m.findByIDFunc(ctx, id)
}

func (m *mockHotelsRepository) InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	return m.insertHotelFunc(ctx, hotel)
}

func (m *mockHotelsRepository) GetDepartmentsByHotelID(ctx context.Context, hotelID string) ([]*models.Department, error) {
	if m.getDepartmentsByHotelIDFunc != nil {
		return m.getDepartmentsByHotelIDFunc(ctx, hotelID)
	}
	return nil, nil
}

func (m *mockHotelsRepository) InsertDepartment(ctx context.Context, hotelID, name string) (*models.Department, error) {
	return nil, nil
}

func (m *mockHotelsRepository) UpdateDepartment(ctx context.Context, id, hotelID, name string) (*models.Department, error) {
	return nil, nil
}

func (m *mockHotelsRepository) DeleteDepartment(ctx context.Context, id, hotelID string) error {
	return nil
}

func TestHotelHandler_GetHotelByID(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 on success", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				floors := 10
				return &models.Hotel{
					CreateHotelRequest: models.CreateHotelRequest{
						ID:     id,
						Name:   "Test Hotel",
						Floors: &floors,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewHotelsHandler(mock, nil)
		app.Get("/hotels/:id", h.GetHotelByID)

		req := httptest.NewRequest("GET", "/hotels/org_2abc123", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 404 when hotel not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			findByIDFunc: func(ctx context.Context, id string) (*models.Hotel, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock, nil)
		app.Get("/hotels/:id", h.GetHotelByID)

		req := httptest.NewRequest("GET", "/hotels/org_2abc123", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 404, resp.StatusCode)
	})
}

func TestHotelsHandler_CreateHotel(t *testing.T) {
	t.Parallel()

	floors := 10
	validBody := `{
		"id": "org_2abc123",
		"name": "The Grand Budapest Hotel",
		"floors": 10
	}`

	newMock := func(returnFloors *int) *mockHotelsRepository {
		return &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return &models.Hotel{
					CreatedAt:          time.Now(),
					UpdatedAt:          time.Now(),
					CreateHotelRequest: *hotel,
				}, nil
			},
		}
	}

	t.Run("returns 201 on success", func(t *testing.T) {
		t.Parallel()

		app := fiber.New()
		h := NewHotelsHandler(newMock(&floors), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 201, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "org_2abc123")
		assert.Contains(t, string(body), "The Grand Budapest Hotel")
		assert.Contains(t, string(body), "10")
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{invalid json`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on missing id", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{
			"name": "The Grand Budapest Hotel",
			"floors": 10
		}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "id")
	})

	t.Run("returns 400 on empty id", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{
			"id": "",
			"name": "The Grand Budapest Hotel",
			"floors": 10
		}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "id")
	})

	t.Run("returns 400 on missing name", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{
			"id": "org_2abc123",
			"floors": 10
		}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "name")
	})

	t.Run("returns 400 on empty name", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{
			"id": "org_2abc123",
			"name": "",
			"floors": 10
		}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "name")
	})

	t.Run("returns 400 on negative floors", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{
			"id": "org_2abc123",
			"name": "The Grand Budapest Hotel",
			"floors": -1
		}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "floors")
	})

	t.Run("returns 400 on floors equal to 0", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{
			"id": "org_2abc123",
			"name": "The Grand Budapest Hotel",
			"floors": 0
		}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "floors")
	})

	t.Run("returns 201 with no floors (optional)", func(t *testing.T) {
		t.Parallel()

		app := fiber.New()
		h := NewHotelsHandler(newMock(nil), nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(`{
			"id": "org_2abc123",
			"name": "The Grand Budapest Hotel"
		}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 201, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockHotelsRepository{
			insertHotelFunc: func(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewHotelsHandler(mock, nil)
		app.Post("/hotels", h.CreateHotel)

		req := httptest.NewRequest("POST", "/hotels", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
