package handler

import (
	"context"
	"errors"
	"io"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockRoomsRepository struct {
	findRoomsFunc   func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error)
	findFloorsFunc  func(ctx context.Context, hotelID string) ([]int, error)
	findRoomByIDFunc func(ctx context.Context, hotelID string, id string) (*models.RoomWithOptionalGuestBooking, error)
}

func (m *mockRoomsRepository) FindRoomsWithOptionalGuestBookingsByFloor(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
	return m.findRoomsFunc(ctx, filter, hotelID, cursorRoomNumber)
}

func (m *mockRoomsRepository) FindAllFloors(ctx context.Context, hotelID string) ([]int, error) {
	return m.findFloorsFunc(ctx, hotelID)
}

func (m *mockRoomsRepository) FindRoomByID(ctx context.Context, hotelID string, id string) (*models.RoomWithOptionalGuestBooking, error) {
	return m.findRoomByIDFunc(ctx, hotelID, id)
}

var _ RoomsRepository = (*mockRoomsRepository)(nil)

const testHotelID = "00000000-0000-0000-0000-000000000001"

func TestRoomsHandler_FilterRooms(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with rooms and no guests when rooms are vacant", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				return []*models.RoomWithOptionalGuestBooking{
					{
						Room: models.Room{
							ID:         "530e8400-e458-41d4-a716-446655440111",
							RoomNumber: 101,
							Floor:      1,
							SuiteType:  "standard",
							RoomStatus: "available",
						},
						Guests: nil,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"items"`)
		assert.Contains(t, string(body), "530e8400-e458-41d4-a716-446655440111")
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
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
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
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{"floors":[2]}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)
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
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				return []*models.RoomWithOptionalGuestBooking{}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{"floors":[99]}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)
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
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				return rooms, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{"limit":5}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"has_more":true`)
		assert.Contains(t, string(body), `"next_cursor"`)
	})

	t.Run("passes cursor, filter, and hotelID to repository", func(t *testing.T) {
		t.Parallel()

		var capturedFilter *models.FilterRoomsRequest
		var capturedHotelID string
		var capturedCursor int
		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				capturedFilter = filter
				capturedHotelID = hotelID
				capturedCursor = cursorRoomNumber
				return []*models.RoomWithOptionalGuestBooking{}, nil
			},
		}

		app := fiber.New()
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{"cursor":"200","limit":10}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		require.NotNil(t, capturedFilter)
		assert.Equal(t, 10, capturedFilter.Limit)
		assert.Equal(t, testHotelID, capturedHotelID)
		assert.Equal(t, 200, capturedCursor)
	})

	t.Run("returns 400 when hotel_id header is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when hotel_id header is invalid", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, "not-a-uuid")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	// invalid cursor is handled in repository now; handler does not validate cursor

	t.Run("returns 500 when repository fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 400 when request body is invalid json", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findRoomsFunc: func(ctx context.Context, filter *models.FilterRoomsRequest, hotelID string, cursorRoomNumber int) ([]*models.RoomWithOptionalGuestBooking, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Post("/rooms", h.FilterRooms)

		req := httptest.NewRequest("POST", "/rooms", strings.NewReader(`{`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestRoomsHandler_GetFloors(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with floors", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findFloorsFunc: func(ctx context.Context, hotelID string) ([]int, error) {
				return []int{1, 2, 3}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Get("/rooms/floors", h.GetFloors)

		req := httptest.NewRequest("GET", "/rooms/floors", nil)
		req.Header.Set(hotelIDHeader, testHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `1`)
		assert.Contains(t, string(body), `2`)
		assert.Contains(t, string(body), `3`)
	})

	t.Run("returns 400 when hotel_id header is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findFloorsFunc: func(ctx context.Context, hotelID string) ([]int, error) {
				return []int{}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Get("/rooms/floors", h.GetFloors)

		req := httptest.NewRequest("GET", "/rooms/floors", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when hotel_id header is invalid", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findFloorsFunc: func(ctx context.Context, hotelID string) ([]int, error) {
				return []int{}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Get("/rooms/floors", h.GetFloors)

		req := httptest.NewRequest("GET", "/rooms/floors", nil)
		req.Header.Set(hotelIDHeader, "not-a-uuid")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 500 when repository fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockRoomsRepository{
			findFloorsFunc: func(ctx context.Context, hotelID string) ([]int, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRoomsHandler(mock)
		app.Get("/rooms/floors", h.GetFloors)

		req := httptest.NewRequest("GET", "/rooms/floors", nil)
		req.Header.Set(hotelIDHeader, testHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
