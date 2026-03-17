package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockGuestsRepository struct {
	insertGuestFunc                func(ctx context.Context, req *models.CreateGuest) (*models.Guest, error)
	findGuestFunc                  func(ctx context.Context, id string) (*models.Guest, error)
	updateGuestFunc                func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error)
	findGuestWithActiveBookingFunc func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error)
}

func (m *mockGuestsRepository) InsertGuest(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
	return m.insertGuestFunc(ctx, guest)
}

func (m *mockGuestsRepository) FindGuest(ctx context.Context, id string) (*models.Guest, error) {
	return m.findGuestFunc(ctx, id)
}

func (m *mockGuestsRepository) UpdateGuest(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
	return m.updateGuestFunc(ctx, id, update)
}

func (m *mockGuestsRepository) FindGuestWithActiveBooking(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
	if m.findGuestWithActiveBookingFunc == nil {
		return []*models.GuestListItem{}, nil
	}
	return m.findGuestWithActiveBookingFunc(ctx, hotelID, filter)
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

	t.Run("returns 409 when guest already exists", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			insertGuestFunc: func(ctx context.Context, guest *models.CreateGuest) (*models.Guest, error) {
				return nil, errs.ErrAlreadyExistsInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests", h.CreateGuest)

		req := httptest.NewRequest("POST", "/guests", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 409, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "already exists")
	})
}

func TestGuestsHandler_GetGuest(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with guest", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestFunc: func(ctx context.Context, id string) (*models.Guest, error) {
				return &models.Guest{
					ID:        "530e8400-e458-41d4-a716-446655440000",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateGuest: models.CreateGuest{
						FirstName: "John",
						LastName:  "Doe",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Get("/guests/:id", h.GetGuest)

		req := httptest.NewRequest("GET", "/guests/530e8400-e458-41d4-a716-446655440000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "530e8400-e458-41d4-a716-446655440000")
	})

	t.Run("returns 400 when invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestFunc: func(ctx context.Context, id string) (*models.Guest, error) {
				return nil, errors.New("error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Get("/guests/:id", h.GetGuest)

		req := httptest.NewRequest("GET", "/guests/notaUUID", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 404 when guest not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestFunc: func(ctx context.Context, id string) (*models.Guest, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Get("/guests/:id", h.GetGuest)

		req := httptest.NewRequest("GET", "/guests/530e8400-e458-41d4-a716-446655440001", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestFunc: func(ctx context.Context, id string) (*models.Guest, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Get("/guests/:id", h.GetGuest)

		req := httptest.NewRequest("GET", "/guests/530e8400-e458-41d4-a716-446655440001", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestGuestsHandler_UpdateGuest(t *testing.T) {
	t.Parallel()

	validID := "530e8400-e458-41d4-a716-446655440000"

	t.Run("returns 200 on valid update with required fields", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			updateGuestFunc: func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
				require.Equal(t, validID, id)
				require.Equal(t, "Jane", update.FirstName)
				require.Equal(t, "Smith", update.LastName)

				return &models.Guest{
					ID:        validID,
					CreatedAt: time.Now().Add(-time.Hour),
					UpdatedAt: time.Now(),
					CreateGuest: models.CreateGuest{
						FirstName: update.FirstName,
						LastName:  update.LastName,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane","last_name":"Smith"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "Jane")
		assert.Contains(t, string(body), "Smith")
	})

	t.Run("returns 400 when first_name is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"last_name":"Smith"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "first_name")
	})

	t.Run("returns 400 when last_name is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "last_name")
	})

	t.Run("returns 400 when both required fields are empty strings", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"","last_name":""}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "first_name")
		assert.Contains(t, string(body), "last_name")
	})

	t.Run("returns 400 on invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/not-a-uuid",
			bytes.NewBufferString(`{"first_name":"Jane","last_name":"Smith"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{invalid json`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid timezone", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane","last_name":"Smith","timezone":"Eastern"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "timezone")
	})

	t.Run("returns 404 when guest not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			updateGuestFunc: func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane","last_name":"Smith"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			updateGuestFunc: func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
				return nil, errors.New("db failure")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane","last_name":"Smith"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestGuestsHandler_SearchGuests(t *testing.T) {
	t.Parallel()

	const testHotelID = "00000000-0000-0000-0000-000000000001"

	t.Run("returns 200 with paginated guest items", func(t *testing.T) {
		t.Parallel()

		items := make([]*models.GuestListItem, 6) // limit=5, repo returns 6
		for i := range items {
			items[i] = &models.GuestListItem{
				GuestID:        "530e8400-e458-41d4-a716-44665544000" + string(rune('1'+i)),
				GovernmentName: "Guest " + string(rune('A'+i)),
				PreferredName:  "Pref " + string(rune('A'+i)),
				Floor:          1,
				RoomNumber:     100 + i,
				GroupSize:      2,
			}
		}

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				require.Equal(t, testHotelID, hotelID)
				require.Equal(t, 5, filter.Limit)
				return items, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		req := httptest.NewRequest(
			"POST",
			"/guests/search",
			bytes.NewBufferString(`{"limit":5}`),
		)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"items"`)
		assert.Contains(t, string(body), `"has_more":true`)
		assert.Contains(t, string(body), `"next_cursor"`)
	})

	t.Run("passes filters and cursor to repository", func(t *testing.T) {
		t.Parallel()

		search := "jane"
		cursor := "530e8400-e458-41d4-a716-446655440000"

		var capturedHotelID string
		var capturedFilter *models.GuestSearchFilter

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				capturedHotelID = hotelID
				capturedFilter = filter
				return []*models.GuestListItem{}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		reqBody := `{
			"floors":[1,3],
			"group_size_min":2,
			"group_size_max":4,
			"search_term":"` + search + `",
			"cursor":"` + cursor + `",
			"limit":10
		}`

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(reqBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		require.NotNil(t, capturedFilter)
		assert.Equal(t, testHotelID, capturedHotelID)
		require.NotNil(t, capturedFilter.Floors)
		assert.Equal(t, []int{1, 3}, *capturedFilter.Floors)
		require.NotNil(t, capturedFilter.GroupSizeMin)
		require.NotNil(t, capturedFilter.GroupSizeMax)
		assert.Equal(t, 2, *capturedFilter.GroupSizeMin)
		assert.Equal(t, 4, *capturedFilter.GroupSizeMax)
		require.NotNil(t, capturedFilter.SearchTerm)
		assert.Equal(t, search, *capturedFilter.SearchTerm)
		require.NotNil(t, capturedFilter.Cursor)
		assert.Equal(t, cursor, *capturedFilter.Cursor)
		assert.Equal(t, 10, capturedFilter.Limit)
	})

	t.Run("returns 400 when hotel header missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				return []*models.GuestListItem{}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid json", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				return []*models.GuestListItem{}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{invalid`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when group range invalid", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				return []*models.GuestListItem{}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		req := httptest.NewRequest(
			"POST",
			"/guests/search",
			bytes.NewBufferString(`{"group_size_min":5,"group_size_max":2}`),
		)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when cursor is invalid uuid", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				return []*models.GuestListItem{}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		req := httptest.NewRequest(
			"POST",
			"/guests/search",
			bytes.NewBufferString(`{"cursor":"not-a-uuid"}`),
		)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 500 when repository errors", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				return nil, errors.New("db failure")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"limit":5}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("defaults limit when omitted", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestWithActiveBookingFunc: func(ctx context.Context, hotelID string, filter *models.GuestSearchFilter) ([]*models.GuestListItem, error) {
				return []*models.GuestListItem{
					{
						GuestID:        "530e8400-e458-41d4-a716-446655440000",
						GovernmentName: "Jane Doe",
						PreferredName:  "Jane",
						Floor:          2,
						RoomNumber:     202,
						GroupSize:      2,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.SearchGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(hotelIDHeader, testHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"has_more":false`)

		var page utils.CursorPage[*models.GuestListItem]
		err = json.Unmarshal(body, &page)
		require.NoError(t, err)
		assert.Len(t, page.Items, 1)
	})
}
