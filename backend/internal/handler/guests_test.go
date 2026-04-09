package handler

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http/httptest"
	"strings"
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
	insertGuestFunc    func(ctx context.Context, req *models.CreateGuest) (*models.Guest, error)
	findGuestFunc      func(ctx context.Context, id string) (*models.Guest, error)
	updateGuestFunc    func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error)
	findGuestsFunc     func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error)
	findGuestStaysFunc func(ctx context.Context, id string) (*models.GuestWithStays, error)
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

func (m *mockGuestsRepository) FindGuestsWithActiveBooking(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
	return m.findGuestsFunc(ctx, f)
}

func (m *mockGuestsRepository) FindGuestWithStayHistory(ctx context.Context, id string) (*models.GuestWithStays, error) {
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
		app.Get("/guests/:id", h.GetGuest)

		req := httptest.NewRequest("GET", "/guests/530e8400-e458-41d4-a716-446655440001", nil)
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
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				return &models.GuestPage{
					Data: []*models.GuestWithBooking{
						{ID: "530e8400-e458-41d4-a716-446655440000", FirstName: "John", LastName: "Doe"},
					},
					NextCursor: nil,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
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
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				assert.Equal(t, []int{3}, f.Floors)
				return &models.GuestPage{
					Data:       []*models.GuestWithBooking{},
					NextCursor: nil,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
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

		cursor := "John Doe|530e8400-e458-41d4-a716-446655440000"
		nextCursor := "Jane Smith|530e8400-e458-41d4-a716-446655440001"

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				assert.Equal(t, "John Doe", f.CursorName)
				assert.Equal(t, "530e8400-e458-41d4-a716-446655440000", f.CursorID)
				assert.Equal(t, 10, f.Limit)
				return &models.GuestPage{
					Data:       []*models.GuestWithBooking{},
					NextCursor: &nextCursor,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid cursor", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"cursor":"not-a-uuid"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on cursor with pipe but invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"cursor":"John Doe|not-a-uuid"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("passes search filter to repository", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				assert.Equal(t, "john", f.Search)
				return &models.GuestPage{Data: []*models.GuestWithBooking{}, NextCursor: nil}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"search":"john"}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("passes group_size filter to repository", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				assert.Equal(t, []int{2, 3}, f.GroupSize)
				return &models.GuestPage{Data: []*models.GuestWithBooking{}, NextCursor: nil}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
		app.Post("/guests/search", h.GetGuests)

		req := httptest.NewRequest("POST", "/guests/search", bytes.NewBufferString(`{"group_size":[2,3]}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				return &models.GuestPage{
					Data:       []*models.GuestWithBooking{},
					NextCursor: nil,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
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
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				assert.Equal(t, validHotelID, f.HotelID)
				return &models.GuestPage{Data: []*models.GuestWithBooking{}, NextCursor: nil}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
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
			findGuestsFunc: func(ctx context.Context, f *models.GuestFilters) (*models.GuestPage, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns new profile fields when present", func(t *testing.T) {
		t.Parallel()

		pronouns := "she/her"
		housekeeping := "daily"
		phone := "+1 (617) 012-3456"
		email := "jane@example.com"
		groupSize := 3

		mock := &mockGuestsRepository{
			findGuestStaysFunc: func(ctx context.Context, id string) (*models.GuestWithStays, error) {
				return &models.GuestWithStays{
					ID:                  id,
					FirstName:           "Jane",
					LastName:            "Doe",
					Pronouns:            &pronouns,
					HousekeepingCadence: &housekeeping,
					Phone:               &phone,
					Email:               &email,
					Assistance: &models.Assistance{
						Accessibility: []string{"wheelchair"},
						Dietary:       []string{"peanuts"},
						Medical:       []string{"pollen allergy"},
					},
					CurrentStays: []models.Stay{
						{
							ArrivalDate:   time.Now(),
							DepartureDate: time.Now().Add(24 * time.Hour),
							RoomNumber:    101,
							GroupSize:     &groupSize,
							Status:        models.BookingStatusActive,
						},
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "she/her")
		assert.Contains(t, string(body), "daily")
		assert.Contains(t, string(body), "wheelchair")
		assert.Contains(t, string(body), "peanuts")
		assert.Contains(t, string(body), "pollen allergy")
		assert.Contains(t, string(body), "3")
	})

	t.Run("returns 200 when optional profile fields are absent", func(t *testing.T) {
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
		h := NewGuestsHandler(mock, nil)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.NotContains(t, string(body), "pronouns")
		assert.NotContains(t, string(body), "assistance")
		assert.NotContains(t, string(body), "housekeeping_cadence")
	})

	t.Run("returns group_size in stay", func(t *testing.T) {
		t.Parallel()

		groupSize := 5
		mock := &mockGuestsRepository{
			findGuestStaysFunc: func(ctx context.Context, id string) (*models.GuestWithStays, error) {
				return &models.GuestWithStays{
					ID:        id,
					FirstName: "John",
					LastName:  "Doe",
					PastStays: []models.Stay{
						{
							ArrivalDate:   time.Now().Add(-48 * time.Hour),
							DepartureDate: time.Now().Add(-24 * time.Hour),
							RoomNumber:    202,
							GroupSize:     &groupSize,
							Status:        models.BookingStatusInactive,
						},
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
		app.Get("/guests/stays/:id", h.GetGuestWithStays)

		req := httptest.NewRequest("GET", "/guests/stays/"+validID, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"group_size":5`)
	})
}

func TestGuestsHandler_UpdateGuest(t *testing.T) {
	t.Parallel()

	validID := "530e8400-e458-41d4-a716-446655440000"

	t.Run("returns 200 when updating first and last name", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			updateGuestFunc: func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
				require.Equal(t, validID, id)
				require.Equal(t, "Jane", *update.FirstName)
				require.Equal(t, "Smith", *update.LastName)

				return &models.Guest{
					ID:        validID,
					CreatedAt: time.Now().Add(-time.Hour),
					UpdatedAt: time.Now(),
					CreateGuest: models.CreateGuest{
						FirstName: *update.FirstName,
						LastName:  *update.LastName,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
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

	t.Run("returns 200 when only first_name is updated", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			updateGuestFunc: func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
				require.Equal(t, "Jane", *update.FirstName)
				require.Nil(t, update.LastName)
				return &models.Guest{
					ID:        validID,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					CreateGuest: models.CreateGuest{
						FirstName: *update.FirstName,
						LastName:  "Doe",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 200 when only notes is updated", func(t *testing.T) {
		t.Parallel()

		notes := "VIP guest"
		mock := &mockGuestsRepository{
			updateGuestFunc: func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
				require.Nil(t, update.FirstName)
				require.Nil(t, update.LastName)
				require.Equal(t, notes, *update.Notes)
				return &models.Guest{
					ID:        validID,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					Notes:     update.Notes,
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"notes":"VIP guest"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "VIP guest")
	})

	t.Run("returns 200 when no fields are provided", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{
			updateGuestFunc: func(ctx context.Context, id string, update *models.UpdateGuest) (*models.Guest, error) {
				require.Nil(t, update.FirstName)
				require.Nil(t, update.LastName)
				require.Nil(t, update.Notes)
				return &models.Guest{
					ID:        validID,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}, nil
			},
		}

		app := fiber.New()
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 400 when first_name is blank string", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":""}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "first_name")
	})

	t.Run("returns 400 when last_name is blank string", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"last_name":""}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "last_name")
	})

	t.Run("returns 400 when notes exceeds 1000 chars", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		longNotes := `{"notes":"` + strings.Repeat("a", 1001) + `"}`
		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(longNotes),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "notes")
	})

	t.Run("returns 400 on invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockGuestsRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/not-a-uuid",
			bytes.NewBufferString(`{"first_name":"Jane"}`),
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
		h := NewGuestsHandler(mock, nil)
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
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"timezone":"Eastern"}`),
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
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane"}`),
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
		h := NewGuestsHandler(mock, nil)
		app.Put("/guests/:id", h.UpdateGuest)

		req := httptest.NewRequest(
			"PUT",
			"/guests/"+validID,
			bytes.NewBufferString(`{"first_name":"Jane"}`),
		)
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}
