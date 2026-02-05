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

// Mock repository - allows us to control what the "database" returns in tests
type mockUsersRepository struct {
	findUserByIdFunc func(ctx context.Context, id string) (*models.User, error)
	insertUserFunc   func(ctx context.Context, user *models.CreateUser) (*models.User, error)
}

// Implement the interface - calls our controllable function
func (m *mockUsersRepository) FindUser(ctx context.Context, id string) (*models.User, error) {
	if m.findUserByIdFunc != nil {
		return m.findUserByIdFunc(ctx, id)
	}
	return nil, nil
}

func (m *mockUsersRepository) InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error) {
	if m.insertUserFunc != nil {
		return m.insertUserFunc(ctx, user)
	}
	return nil, nil
}

func TestUsersHandler_GetUserByID(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with user", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			findUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
				role := "admin"
				return &models.User{
					CreateUser: models.CreateUser{
						FirstName: "John",
						LastName:  "Doe",
						Role:      &role,
						ID: "550e8400-e29b-41d4-a716-446655440000",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewUsersHandler(mock)
		app.Get("/users/:id", h.GetUserByID)

		req := httptest.NewRequest("GET", "/users/550e8400-e29b-41d4-a716-446655440000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "John")
		assert.Contains(t, string(body), "Doe")
	})

	t.Run("returns 404 when user not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			findUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Get("/users/:id", h.GetUserByID)

		req := httptest.NewRequest("GET", "/users/nonexistent-id", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on database error", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			findUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
				return nil, errors.New("database connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Get("/users/:id", h.GetUserByID)

		req := httptest.NewRequest("GET", "/users/some-id", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestUsersHandler_GetUserByID_InvalidMethods(t *testing.T) {
	t.Parallel()

	mock := &mockUsersRepository{
		findUserByIdFunc: func(ctx context.Context, id string) (*models.User, error) {
			return &models.User{
				CreateUser: models.CreateUser{
					FirstName: "John",
					ID: "123",
				},
				
			}, nil
		},
	}

	app := fiber.New()
	h := NewUsersHandler(mock)
	app.Get("/users/:id", h.GetUserByID)

	tests := []struct {
		name           string
		method         string
		expectedStatus int
	}{
		{"POST not allowed", "POST", 405},
		{"PUT not allowed", "PUT", 405},
		{"DELETE not allowed", "DELETE", 405},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := httptest.NewRequest(tt.method, "/users/123", nil)
			resp, err := app.Test(req)
			require.NoError(t, err)

			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}

func TestUsersHandler_CreateUser(t *testing.T) {
	t.Parallel()
	validBody := `{
		"first_name": "John",
		"last_name": "Doe",
		"role": "Receptionist",
		"clerk_id": "user_123"
	}`

	t.Run("returns 200 on valid user creation", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return &models.User{
					CreatedAt:  time.Now(),
					UpdatedAt:  time.Now(),
					CreateUser: *user,
				}, nil
			},
		}

		app := fiber.New()
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "generated-uuid")
		assert.Contains(t, string(body), "John")
		assert.Contains(t, string(body), "Receptionist")
	})

	t.Run("returns 200 when optional fields are provided", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return &models.User{
					CreatedAt:  time.Now(),
					UpdatedAt:  time.Now(),
					CreateUser: *user,
				}, nil
			},
		}

		app := fiber.New()
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		bodyWithOptionals := `{
			"first_name": "Jane",
			"last_name": "Dow",
			"role": "Manager",
			"employee_id": "EMP-67",
			"department": "Front Desk",
			"timezone": "America/New_York",
			"clerk_id": "user_123"
		}`

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(bodyWithOptionals))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "EMP-67")
		assert.Contains(t, string(body), "America/New_York")
	})

	t.Run("returns 400 on invalid JSON body", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(`{invalid json`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when required fields are missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "first_name")
		assert.Contains(t, string(body), "last_name")
		assert.Contains(t, string(body), "clerk_id")
	})

	t.Run("returns 400 on invalid timezone", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		invalidTimezoneBody := `{
			"first_name": "John",
			"last_name": "Doe",
			"role": "Receptionist",
			"clerk_id": "user_123",
			"timezone": "Invalid/Not_A_Timezone"
		}`

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(invalidTimezoneBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "timezone")
	})

	t.Run("returns 500 when repository fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns_400_when_clerk_id_is_missing", func(t *testing.T) {
		body := `{
		"first_name": "John",
		"last_name": "Doe",
		"role": "Receptionist"
	}`

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
		respBody, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(respBody), "clerk_id")

	})
}
