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

type mockUsersRepository struct {
	insertUserFunc func(ctx context.Context, req *models.CreateUser) (*models.User, error)
}

func (m *mockUsersRepository) InsertUser(
	ctx context.Context,
	user *models.CreateUser,
) (*models.User, error) {
	return m.insertUserFunc(ctx, user)
}

// Makes the compiler verify the mock
var _ storage.UsersRepository = (*mockUsersRepository)(nil)

func TestUsersHandler_CreateUser(t *testing.T) {
	t.Parallel()
	validBody := `{
		"first_name": "John",
		"last_name": "Doe",
		"role": "Receptionist"
	}`

	t.Run("returns 200 on valid user creation", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return &models.User{
					ID:         "generated-uuid",
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
					ID:         "generated-uuid",
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
			"timezone": "America/New_York"
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

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, nil
			},
		}

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

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, nil
			},
		}

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
		assert.Contains(t, string(body), "role")
	})

	t.Run("returns 400 on invalid timezone", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock)
		app.Post("/users", h.CreateUser)

		invalidTimezoneBody := `{
			"first_name": "John",
			"last_name": "Doe",
			"role": "Receptionist",
			"timezone": "EST"
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
}
