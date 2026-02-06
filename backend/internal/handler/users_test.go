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
	insertUserFunc         func(ctx context.Context, req *models.CreateUser) (*models.User, error)
	updateProfilePicFunc   func(ctx context.Context, userId string, key string) error
	deleteProfilePicFunc   func(ctx context.Context, userId string) error
	getKeyFunc             func(ctx context.Context, userId string) (string, error)
}

func (m *mockUsersRepository) InsertUser(
	ctx context.Context,
	user *models.CreateUser,
) (*models.User, error) {
	return m.insertUserFunc(ctx, user)
}

func (m *mockUsersRepository) UpdateProfilePicture(
	ctx context.Context,
	userId string,
	key string,
) error {
	if m.updateProfilePicFunc != nil {
		return m.updateProfilePicFunc(ctx, userId, key)
	}
	return nil
}

func (m *mockUsersRepository) DeleteProfilePicture(
	ctx context.Context,
	userId string,
) error {
	if m.deleteProfilePicFunc != nil {
		return m.deleteProfilePicFunc(ctx, userId)
	}
	return nil
}

func (m *mockUsersRepository) GetKey(
	ctx context.Context,
	userId string,
) (string, error) {
	if m.getKeyFunc != nil {
		return m.getKeyFunc(ctx, userId)
	}
	return "", nil
}

// Makes the compiler verify the mock
var _ storage.UsersRepository = (*mockUsersRepository)(nil)

// Mock S3 Storage for testing
type mockS3Storage struct {
	deleteFileFunc func(ctx context.Context, key string) error
}

func (m *mockS3Storage) GeneratePresignedURL(ctx context.Context, key string, expiration time.Duration) (string, error) {
	return "", nil
}

func (m *mockS3Storage) GeneratePresignedGetURL(ctx context.Context, key string, expiration time.Duration) (string, error) {
	return "", nil
}

func (m *mockS3Storage) DeleteFile(ctx context.Context, key string) error {
	if m.deleteFileFunc != nil {
		return m.deleteFileFunc(ctx, key)
	}
	return nil
}

// Makes the compiler verify the S3 mock implements the interface
var _ storage.S3Storage = (*mockS3Storage)(nil)

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
		h := NewUsersHandler(mock, &mockS3Storage{})
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
		h := NewUsersHandler(mock, &mockS3Storage{})
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
		h := NewUsersHandler(mock, &mockS3Storage{})
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
		h := NewUsersHandler(mock, &mockS3Storage{})
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
		h := NewUsersHandler(mock, &mockS3Storage{})
		app.Post("/users", h.CreateUser)

		invalidTimezoneBody := `{
			"first_name": "John",
			"last_name": "Doe",
			"role": "Receptionist",
			"timezone": "Not/A_Valid_Timezone"
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
		h := NewUsersHandler(mock, &mockS3Storage{})
		app.Post("/users", h.CreateUser)

		req := httptest.NewRequest("POST", "/users", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestUsersHandler_UpdateProfilePicture(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 on valid update", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			updateProfilePicFunc: func(ctx context.Context, userId string, key string) error {
				return nil
			},
		}

		app := fiber.New()
		h := NewUsersHandler(mock, &mockS3Storage{})
		app.Put("/users/:userId/profile-picture", h.UpdateProfilePicture)

		body := `{"key": "profile-pictures/user123/1706540000.jpg"}`
		req := httptest.NewRequest("PUT", "/users/user123/profile-picture", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		respBody, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(respBody), "successfully")
	})

	t.Run("returns 400 when key is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock, &mockS3Storage{})
		app.Put("/users/:userId/profile-picture", h.UpdateProfilePicture)

		req := httptest.NewRequest("PUT", "/users/user123/profile-picture", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "key")
	})

	t.Run("returns 400 when key is empty string", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock, &mockS3Storage{})
		app.Put("/users/:userId/profile-picture", h.UpdateProfilePicture)

		req := httptest.NewRequest("PUT", "/users/user123/profile-picture", bytes.NewBufferString(`{"key": ""}`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock, &mockS3Storage{})
		app.Put("/users/:userId/profile-picture", h.UpdateProfilePicture)

		req := httptest.NewRequest("PUT", "/users/user123/profile-picture", bytes.NewBufferString(`{invalid`))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 500 when repository fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockUsersRepository{
			updateProfilePicFunc: func(ctx context.Context, userId string, key string) error {
				return errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewUsersHandler(mock, &mockS3Storage{})
		app.Put("/users/:userId/profile-picture", h.UpdateProfilePicture)

		body := `{"key": "profile-pictures/user123/1706540000.jpg"}`
		req := httptest.NewRequest("PUT", "/users/user123/profile-picture", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestUsersHandler_DeleteProfilePicture(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 on successful delete", func(t *testing.T) {
		t.Parallel()

		mockRepo := &mockUsersRepository{
			getKeyFunc: func(ctx context.Context, userId string) (string, error) {
				return "profile-pictures/user123/1706540000.jpg", nil
			},
			deleteProfilePicFunc: func(ctx context.Context, userId string) error {
				return nil
			},
		}

		mockS3 := &mockS3Storage{
			deleteFileFunc: func(ctx context.Context, key string) error {
				return nil
			},
		}

		app := fiber.New()
		h := &UsersHandler{UsersRepository: mockRepo, S3Storage: mockS3}
		app.Delete("/users/:userId/profile-picture", h.DeleteProfilePicture)

		req := httptest.NewRequest("DELETE", "/users/user123/profile-picture", nil)

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "deleted successfully")
	})

	t.Run("returns 200 when user has no profile picture", func(t *testing.T) {
		t.Parallel()

		mockRepo := &mockUsersRepository{
			getKeyFunc: func(ctx context.Context, userId string) (string, error) {
				return "", nil // No existing profile picture
			},
			deleteProfilePicFunc: func(ctx context.Context, userId string) error {
				return nil
			},
		}

		app := fiber.New()
		h := &UsersHandler{UsersRepository: mockRepo, S3Storage: &mockS3Storage{}}
		app.Delete("/users/:userId/profile-picture", h.DeleteProfilePicture)

		req := httptest.NewRequest("DELETE", "/users/user123/profile-picture", nil)

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 500 when GetKey fails", func(t *testing.T) {
		t.Parallel()

		mockRepo := &mockUsersRepository{
			getKeyFunc: func(ctx context.Context, userId string) (string, error) {
				return "", errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := &UsersHandler{UsersRepository: mockRepo, S3Storage: &mockS3Storage{}}
		app.Delete("/users/:userId/profile-picture", h.DeleteProfilePicture)

		req := httptest.NewRequest("DELETE", "/users/user123/profile-picture", nil)

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 500 when S3 delete fails", func(t *testing.T) {
		t.Parallel()

		mockRepo := &mockUsersRepository{
			getKeyFunc: func(ctx context.Context, userId string) (string, error) {
				return "profile-pictures/user123/1706540000.jpg", nil
			},
		}

		mockS3 := &mockS3Storage{
			deleteFileFunc: func(ctx context.Context, key string) error {
				return errors.New("s3 error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := &UsersHandler{UsersRepository: mockRepo, S3Storage: mockS3}
		app.Delete("/users/:userId/profile-picture", h.DeleteProfilePicture)

		req := httptest.NewRequest("DELETE", "/users/user123/profile-picture", nil)

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 500 when DB delete fails", func(t *testing.T) {
		t.Parallel()

		mockRepo := &mockUsersRepository{
			getKeyFunc: func(ctx context.Context, userId string) (string, error) {
				return "profile-pictures/user123/1706540000.jpg", nil
			},
			deleteProfilePicFunc: func(ctx context.Context, userId string) error {
				return errors.New("db error")
			},
		}

		mockS3 := &mockS3Storage{
			deleteFileFunc: func(ctx context.Context, key string) error {
				return nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := &UsersHandler{UsersRepository: mockRepo, S3Storage: mockS3}
		app.Delete("/users/:userId/profile-picture", h.DeleteProfilePicture)

		req := httptest.NewRequest("DELETE", "/users/user123/profile-picture", nil)

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
