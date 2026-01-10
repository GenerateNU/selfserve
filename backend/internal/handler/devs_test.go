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
type mockDevsRepository struct {
	getMemberFunc func(ctx context.Context, name string) (*models.Dev, error)
}

func (m *mockDevsRepository) GetMember(ctx context.Context, name string) (*models.Dev, error) {
	return m.getMemberFunc(ctx, name)
}

func TestDevsHandler_GetMember(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with member", func(t *testing.T) {
		t.Parallel()

		mock := &mockDevsRepository{
			getMemberFunc: func(ctx context.Context, name string) (*models.Dev, error) {
				return &models.Dev{
					ID:     "123",
					Member: "Dao",
				}, nil
			},
		}

		app := fiber.New()
		h := NewDevsHandler(mock)
		app.Get("/devs/:name", h.GetMember)

		req := httptest.NewRequest("GET", "/devs/Dao", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "Dao")
	})

	t.Run("returns 404 when not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockDevsRepository{
			getMemberFunc: func(ctx context.Context, name string) (*models.Dev, error) {
				return nil, errs.ErrNotFound
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewDevsHandler(mock)
		app.Get("/devs/:name", h.GetMember)

		req := httptest.NewRequest("GET", "/devs/nobody", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockDevsRepository{
			getMemberFunc: func(ctx context.Context, name string) (*models.Dev, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewDevsHand