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

type mockRequestRepository struct {
	makeRequestFunc func(ctx context.Context, req *models.Request) (*models.Request, error)
	getRequestFunc  func(ctx context.Context, id string) (*models.Request, error)
}

func (m *mockRequestRepository) InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error) {
	return m.makeRequestFunc(ctx, req)
}

func (m *mockRequestRepository) GetRequest(ctx context.Context, id string) (*models.Request, error) {
	return m.getRequestFunc(ctx, id)
}

func TestRequestHandler_GetRequest(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with member", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			getRequestFunc: func(ctx context.Context, name string) (*models.Request, error) {
				return &models.Request{
					ID:        "530e8400-e458-41d4-a716-446655440000",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     "521e8400-e458-41d4-a716-446655440000",
						Name:        "room cleaning",
						RequestType: "recurring",
						Status:      "assigned",
						Priority:    "urgent",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/530e8400-e458-41d4-a716-446655440000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "530e8400-e458-41d4-a716-446655440000")
	})

	t.Run("returns 404 when not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			getRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/12345", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			getRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/failing", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 500 when route is not found/empty", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			getRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
func TestRequestHandler_MakeRequest(t *testing.T) {
	t.Parallel()
	validBody := `{
		"hotel_id": "550e8400-e29b-41d4-a716-446655440000",
		"name": "room cleaning",
		"request_type": "recurring",
		"status": "pending",
		"priority": "high",
		"notes": "No special requests"
	}`

	t.Run("returns 200 on success", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				req.ID = "generated-uuid"
				return req, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "generated-uuid")
		assert.Contains(t, string(body), "room cleaning")

	})

	t.Run("returns 200 when optional uuid fields are valid", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				req.ID = "generated-uuid"
				return req, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock)
		app.Post("/request", h.CreateRequest)

		bodyWithOptionalUUIDs := `{
			"hotel_id": "550e8400-e29b-41d4-a716-446655440000",
			"guest_id": "660e8400-e29b-41d4-a716-446655440000",
			"user_id": "770e8400-e29b-41d4-a716-446655440000",
			"name": "room cleaning",
			"request_type": "recurring",
			"status": "pending",
			"priority": "high",
			"notes": "No special requests"
		}`

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(bodyWithOptionalUUIDs))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "660e8400-e29b-41d4-a716-446655440000")
		assert.Contains(t, string(body), "770e8400-e29b-41d4-a716-446655440000")
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(`{invalid json`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on missing required fields", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "hotel_id")
		assert.Contains(t, string(body), "name")
	})

	t.Run("returns 400 on invalid hotel_id uuid", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Post("/request", h.CreateRequest)

		invalidUUIDBody := `{
			"hotel_id": "not-a-uuid",
			"name": "room cleaning",
			"request_type": "recurring",
			"status": "pending",
			"priority": "high",
			"notes": "No special requests"
		}`

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(invalidUUIDBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "hotel_id")
	})

	t.Run("returns 400 on invalid optional guest_id uuid", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Post("/request", h.CreateRequest)

		invalidGuestIDBody := `{
			"hotel_id": "550e8400-e29b-41d4-a716-446655440000",
			"guest_id": "not-a-uuid",
			"name": "room cleaning",
			"request_type": "recurring",
			"status": "pending",
			"priority": "high",
			"notes": "No special requests"
		}`

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(invalidGuestIDBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "guest_id")
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
