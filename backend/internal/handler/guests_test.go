package handler

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http/httptest"
	"testing"
	"time"
	"fmt"

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
	updateGuestFunc func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error)
	findGuestsFunc func(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error)
	findGuestStaysFunc func (ctx context.Context, id string) (*models.GuestWithStays, error)
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

func (m *mockGuestsRepository) FindGuests(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error) {
	return m.findGuestsFunc(ctx, f)
}

func (m *mockGuestsRepository) FindGuestWithStays(ctx context.Context, id string) (*models.GuestWithStays, error) {
	return m.findGuestStaysFunc(ctx, id)
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


func TestGuestsHandler_GetGuests(t *testing.T) {
	t.Parallel()

	validHotelID := "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

	t.Run("returns 200 with guest page", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error) {
				return &models.GuestPage{
					Data: []*models.GuestWithBooking{
						{ID: "530e8400-e458-41d4-a716-446655440000", FirstName: "John", LastName: "Doe"},
					},
					NextCursor: nil,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "John")
	})

	t.Run("returns 200 with floor filter", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error) {
				assert.Equal(t, []int{3}, f.Floors)
				return &models.GuestPage{
					Data:       []*models.GuestWithBooking{},
					NextCursor: nil,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"floors":[3]}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 200 with cursor and limit", func(t *testing.T) {
		t.Parallel()

		cursor := "530e8400-e458-41d4-a716-446655440000"
		nextCursor := "530e8400-e458-41d4-a716-446655440001"

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error) {
				assert.Equal(t, cursor, f.Cursor)
				assert.Equal(t, 10, f.Limit)
				return &models.GuestPage{
					Data:       []*models.GuestWithBooking{},
					NextCursor: &nextCursor,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		body := fmt.Sprintf(`{"cursor":"%s","limit":10}`, cursor)
		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		respBody, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(respBody), nextCursor)
	})

	t.Run("returns 400 when X-Hotel-ID is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when X-Hotel-ID is invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", "not-a-uuid")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid cursor", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"cursor":"not-a-uuid"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{invalid`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when limit is negative", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"limit":-1}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when limit exceeds max", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"limit":101}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns empty data when no guests match", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error) {
				return &models.GuestPage{
					Data:       []*models.GuestWithBooking{},
					NextCursor: nil,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"data":[]`)
	})

	t.Run("passes hotel ID correctly to repository", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error) {
				assert.Equal(t, validHotelID, f.HotelID)
				return &models.GuestPage{Data: []*models.GuestWithBooking{}, NextCursor: nil}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilter) (*models.GuestPage, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestGuestsHandler_GetGuestWithStays(t *testing.T) {
	t.Parallel()

	validID := "530e8400-e458-41d4-a716-446655440000"

	t.Run("returns 200 with guest and stays", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestStaysFunc: func(ctx context.Context, id string) (*models.GuestWithStays, error) {
				return &models.GuestWithStays{
					ID:        id,
					FirstName: "John",
					LastName:  "Doe",
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), validID)
		assert.Contains(t, string(body), "John")
	})

	t.Run("returns 400 on invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/not-a-uuid", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 404 when guest not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestStaysFunc: func(ctx context.Context, id string) (*models.GuestWithStays, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestStaysFunc: func(ctx context.Context, id string) (*models.GuestWithStays, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("passes correct ID to repository", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestStaysFunc: func(ctx context.Context, id string) (*models.GuestWithStays, error) {
				assert.Equal(t, validID, id)
				return &models.GuestWithStays{ID: id, FirstName: "John", LastName: "Doe"}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})
}