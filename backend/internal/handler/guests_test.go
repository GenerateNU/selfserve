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
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockGuestsRepository struct {
	insertGuestFunc func(ctx context.Context, req *models.CreateGuest) (*models.Guest, error)
	findGuestFunc   func(ctx context.Context, id string) (*models.Guest, error)
}

func (m *mockGuestsRepository) InsertGuest(
	ctx context.Context,
	guest *models.CreateGuest,
) (*models.Guest, error) {
	return m.insertGuestFunc(ctx, guest)
}

func (m *mockGuestsRepository) FindGuest(
	ctx context.Context,
	id string,
) (*models.Guest, error) {
	return m.findGuestFunc(ctx, id)
}

// Makes the compiler verify the mock
var _ storage.GuestsRepository = (*mockGuestsRepository)(nil)

func TestGuestsHandler_CreateGuest(t *testing.T) {
	t.Parallel()
	validBody := `{
		"first_name": "John",
		"last_name": "Doe"
	}`

	t.Run("returns 200 on valid guest creation", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			insertGuestFunc: func(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
				return &models.Guest{
					ID:          "generated-uuid",
					CreatedAt:   time.Now(),
					UpdatedAt:   time.Now(),
					CreateGuest: *guest,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests", h.CreateGuest)

		req := httptest.NewRequest("POST", "/guests", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "generated-uuid")
		assert.Contains(t, string(body), "John")
		assert.Contains(t, string(body), "Doe")
	})

	t.Run("returns 200 when optional fields are provided", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			insertGuestFunc: func(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
				return &models.Guest{
					ID:          "generated-uuid",
					CreatedAt:   time.Now(),
					UpdatedAt:   time.Now(),
					CreateGuest: *guest,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests", h.CreateGuest)

		bodyWithOptionals := `{
			"first_name": "Jane",
			"last_name": "Dow",
			"profile_picture": "https://example.com/john.jpg",
			"timezone": "America/New_York"
		}`

		req := httptest.NewRequest("POST", "/guests", bytes.NewBufferString(bodyWithOptionals))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "America/New_York")
	})

	t.Run("returns 400 on invalid JSON body", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			insertGuestFunc: func(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests", h.CreateGuest)

		req := httptest.NewRequest("POST", "/guests", bytes.NewBufferString(`{invalid json`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when required fields are missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			insertGuestFunc: func(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests", h.CreateGuest)

		req := httptest.NewRequest("POST", "/guests", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "first_name")
		assert.Contains(t, string(body), "last_name")
	})

	t.Run("returns 400 on invalid timezone", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			insertGuestFunc: func(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests", h.CreateGuest)

		invalidTimezoneBody := `{
			"first_name": "Jane",
			"last_name": "Dow",
			"profile_picture": "https://example.com/john.jpg",
			"timezone": "Eastern"
		}`

		req := httptest.NewRequest("POST", "/guests", bytes.NewBufferString(invalidTimezoneBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "timezone")
	})

	t.Run("returns 500 when repository fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			insertGuestFunc: func(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests", h.CreateGuest)

		req := httptest.NewRequest("POST", "/guests", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
