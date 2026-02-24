package handler

import (
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

type mockRoomsRepository struct {
	findRoomsFunc func(ctx context.Context) ([]models.Room, error)
}

func (m *mockRoomsRepository) FindRooms(ctx context.Context) ([]models.Room, error) {
	if m.findRoomsFunc != nil {
		return m.findRoomsFunc(ctx)
	}
	return nil, nil
}

func TestRoomsHandler_GetRooms(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with rooms", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context) ([]models.Room, error) {
				now := time.Now()
				return []models.Room{
					{
						CreateRoom: models.CreateRoom{
							ID:         "room-101",
							RoomNumber: 101,
							RoomType:   models.RoomTypeKing,
							Features:   []string{"sea_view", "balcony"},
							CreatedAt:  now,
							UpdatedAt:  now,
						},
						CreatedAt: now,
						UpdatedAt: now,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRooms)

		req := httptest.NewRequest("GET", "/rooms", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "room-101")
		assert.Contains(t, string(body), "king")
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context) ([]models.Room, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRooms)

		req := httptest.NewRequest("GET", "/rooms", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

