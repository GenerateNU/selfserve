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

type mockGuestBookingsRepository struct {
	findByFloorFunc func(ctx context.Context, floors []int) ([]*models.GuestBooking, error)
}

func (m *mockGuestBookingsRepository) FindBookingByFloor(ctx context.Context, floors []int) ([]*models.GuestBooking, error) {
	return m.findByFloorFunc(ctx, floors)
}

func TestGuestBookingHandler_GetBookingsByFloor(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with bookings", func(t *testing.T) {
		t.Parallel()

		expectedFloors := []int{1, 2}

		expectedBookings := []*models.GuestBooking{
			{
				ID: "booking-1",
				Guest: models.Guest{
					ID: "guest-1",
				},
				Room: models.Room{
					RoomNumber: 101,
					Floor:      1,
					SuiteType:  "suite",
					RoomStatus: "occupied",
				},
				Status:        models.BookingStatusActive,
				ArrivalDate:   "2024-01-01",
				DepartureDate: "2024-01-02",
			},
		}

		mock := &mockGuestBookingsRepository{
			findByFloorFunc: func(ctx context.Context, floors []int) ([]*models.GuestBooking, error) {
				assert.Equal(t, expectedFloors, floors)
				return expectedBookings, nil
			},
		}

		app := fiber.New()
		h := NewGuestBookingsHandler(mock)
		app.Get("/guest_bookings/floor", h.GetBookingsByFloor)

		req := httptest.NewRequest("GET", "/guest_bookings/floor?floors=1,2", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)
		for _, booking := range expectedBookings {
			assert.Contains(t, string(body), booking.ID)
		}
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestBookingsRepository{
			findByFloorFunc: func(ctx context.Context, floors []int) ([]*models.GuestBooking, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestBookingsHandler(mock)
		app.Get("/guest_bookings/floor", h.GetBookingsByFloor)

		req := httptest.NewRequest("GET", "/guest_bookings/floor?floors=1", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 400 when floors query is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestBookingsRepository{
			findByFloorFunc: func(ctx context.Context, floors []int) ([]*models.GuestBooking, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestBookingsHandler(mock)
		app.Get("/guest_bookings/floor", h.GetBookingsByFloor)

		req := httptest.NewRequest("GET", "/guest_bookings/floor", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when floors query contains non-integers", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestBookingsRepository{
			findByFloorFunc: func(ctx context.Context, floors []int) ([]*models.GuestBooking, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestBookingsHandler(mock)
		app.Get("/guest_bookings/floor", h.GetBookingsByFloor)

		req := httptest.NewRequest("GET", "/guest_bookings/floor?floors=a,b", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestGetQueryFloors(t *testing.T) {
	t.Parallel()

	t.Run("returns error when input is empty", func(t *testing.T) {
		t.Parallel()

		floors, err := getQueryFloors("")

		assert.Nil(t, floors)
		var httpErr errs.HTTPError
		assert.ErrorAs(t, err, &httpErr)
		assert.Equal(t, 400, httpErr.Code)
	})

	t.Run("parses valid comma-separated integers", func(t *testing.T) {
		t.Parallel()

		floors, err := getQueryFloors("1,2,3")

		require.NoError(t, err)
		assert.Equal(t, []int{1, 2, 3}, floors)
	})

	t.Run("trims whitespace around values", func(t *testing.T) {
		t.Parallel()

		floors, err := getQueryFloors(" 1 ,  2 ,3 ")

		require.NoError(t, err)
		assert.Equal(t, []int{1, 2, 3}, floors)
	})

	t.Run("returns error when any value is not an integer", func(t *testing.T) {
		t.Parallel()

		floors, err := getQueryFloors("1,a,3")

		assert.Nil(t, floors)
		var httpErr errs.HTTPError
		assert.ErrorAs(t, err, &httpErr)
		assert.Equal(t, 400, httpErr.Code)
	})
}
