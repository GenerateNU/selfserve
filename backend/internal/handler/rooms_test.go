package handler

import (
	"context"
	"errors"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockRoomsRepository struct {
	findRoomsFunc func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error)
}

func (m *mockRoomsRepository) FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
	return m.findRoomsFunc(ctx, filter)
}

var _ RoomsRepository = (*mockRoomsRepository)(nil)

func TestRoomsHandler_GetRoomsByFloor(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with rooms and no guests when rooms are vacant", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
				return []*models.RoomWithOptionalGuestBooking{
					{
						Room:   models.Room{RoomNumber: 101, Floor: 1, SuiteType: "standard", RoomStatus: "available"},
						Guests: nil,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRoomsByFloor)

		req := httptest.NewRequest("GET", "/rooms", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"items"`)
		assert.Contains(t, string(body), "101")
		assert.Contains(t, string(body), "standard")
		assert.Contains(t, string(body), `"has_more":false`)
	})

	t.Run("returns 200 with rooms including guest details when occupied", func(t *testing.T) {
		t.Parallel()

		jane := "Jane"
		doe := "Doe"
		pic := "https://example.com/jane.jpg"
		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
				return []*models.RoomWithOptionalGuestBooking{
					{
						Room: models.Room{RoomNumber: 202, Floor: 2, SuiteType: "deluxe", RoomStatus: "occupied"},
						Guests: []models.Guest{
							{
								ID: "530e8400-e458-41d4-a716-446655440000",
								CreateGuest: models.CreateGuest{
									FirstName:      jane,
									LastName:       doe,
									ProfilePicture: &pic,
								},
							},
						},
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRoomsByFloor)

		req := httptest.NewRequest("GET", "/rooms?floors=2", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"items"`)
		assert.Contains(t, string(body), "202")
		assert.Contains(t, string(body), "530e8400-e458-41d4-a716-446655440000")
		assert.Contains(t, string(body), "Jane")
		assert.Contains(t, string(body), "Doe")
	})

	t.Run("returns 200 with empty items when no rooms match filters", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
				return []*models.RoomWithOptionalGuestBooking{}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRoomsByFloor)

		req := httptest.NewRequest("GET", "/rooms?floors=99", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"items":[]`)
		assert.Contains(t, string(body), `"has_more":false`)
	})

	t.Run("returns has_more true and next_cursor when repo returns limit+1 items", func(t *testing.T) {
		t.Parallel()

		rooms := make([]*models.RoomWithOptionalGuestBooking, 6) // limit=5, repo returns 6
		for i := range rooms {
			rooms[i] = &models.RoomWithOptionalGuestBooking{
				Room: models.Room{RoomNumber: 100 + i, Floor: 1, SuiteType: "standard", RoomStatus: "available"},
			}
		}

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
				return rooms, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRoomsByFloor)

		req := httptest.NewRequest("GET", "/rooms?limit=5", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"has_more":true`)
		assert.Contains(t, string(body), `"next_cursor"`)
	})

	t.Run("passes cursor to repository and forwards filter correctly", func(t *testing.T) {
		t.Parallel()

		cursor := utils.EncodeCursor("id", "200")

		var capturedFilter *models.RoomFilter
		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
				capturedFilter = filter
				return []*models.RoomWithOptionalGuestBooking{}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRoomsByFloor)

		req := httptest.NewRequest("GET", "/rooms?cursor="+cursor+"&limit=10", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		require.NotNil(t, capturedFilter)
		assert.Equal(t, cursor, capturedFilter.Cursor)
		assert.Equal(t, 10, capturedFilter.Limit)
	})

	t.Run("returns 400 for invalid cursor", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRoomsByFloor)

		req := httptest.NewRequest("GET", "/rooms?cursor=not-valid-base64!!!", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 500 when repository fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.RoomFilter) ([]*models.RoomWithOptionalGuestBooking, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Get("/rooms", h.GetRoomsByFloor)

		req := httptest.NewRequest("GET", "/rooms", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
