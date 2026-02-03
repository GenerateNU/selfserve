package tests

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockWebhookVerifier struct {
	verifyFunc func(payload []byte, headers http.Header) error
}

func (m *mockWebhookVerifier) Verify(payload []byte, headers http.Header) error {
	return m.verifyFunc(payload, headers)
}

type mockUsersRepositoryClerk struct {
	insertUserFunc func(ctx context.Context, user *models.CreateUser) (*models.User, error)
}

func (m *mockUsersRepositoryClerk) InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error) {
	return m.insertUserFunc(ctx, user)
}

func TestClerkHandler_CreateUser(t *testing.T) {
	t.Parallel()

	validPayload := `{
		"data": {
			"id": "user_123",
			"first_name": "John",
			"last_name": "Doe",
			"has_image": false,
			"image_url": ""
		}
	}`

	t.Run("returns 401 when signature verification fails", func(t *testing.T) {
		t.Parallel()

		webhookMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				return errors.New("invalid signature")
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(userMock, webhookMock)
		app.Post("/webhook", h.CreateUser)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("svix-id", "msg_123")
		req.Header.Set("svix-timestamp", "1614265330")
		req.Header.Set("svix-signature", "invalid")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 200 and creates user when signature is valid", func(t *testing.T) {
		t.Parallel()

		var capturedUser *models.CreateUser

		webhookMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				return nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				capturedUser = user
				return &models.User{
					ID:         "generated-uuid",
					CreatedAt:  time.Now(),
					UpdatedAt:  time.Now(),
					CreateUser: *user,
				}, nil
			},
		}

		app := fiber.New()
		h := handler.NewClerkWebHookHandler(userMock, webhookMock)
		app.Post("/webhook", h.CreateUser)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("svix-id", "msg_123")
		req.Header.Set("svix-timestamp", "1614265330")
		req.Header.Set("svix-signature", "v1,valid")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		assert.Equal(t, "user_123", capturedUser.ClerkID)
		assert.Equal(t, "John", capturedUser.FirstName)
		assert.Equal(t, "Doe", capturedUser.LastName)
	})

	t.Run("returns 400 when payload JSON is invalid", func(t *testing.T) {
		t.Parallel()

		webhookMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				return nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(userMock, webhookMock)
		app.Post("/webhook", h.CreateUser)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(`{invalid`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("svix-id", "msg_123")
		req.Header.Set("svix-timestamp", "1614265330")
		req.Header.Set("svix-signature", "v1,valid")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when required fields are missing", func(t *testing.T) {
		t.Parallel()

		webhookMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				return nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(userMock, webhookMock)
		app.Post("/webhook", h.CreateUser)

		invalidPayload := `{
			"type": "user.created",
			"data": {
				"id": "",
				"first_name": "",
				"last_name": ""
			}
		}`

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(invalidPayload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("svix-id", "msg_123")
		req.Header.Set("svix-timestamp", "1614265330")
		req.Header.Set("svix-signature", "v1,valid")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 500 when user creation fails", func(t *testing.T) {
		t.Parallel()

		webhookMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				return nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(userMock, webhookMock)
		app.Post("/webhook", h.CreateUser)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("svix-id", "msg_123")
		req.Header.Set("svix-timestamp", "1614265330")
		req.Header.Set("svix-signature", "v1,valid")

		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("passes correct headers to verifier", func(t *testing.T) {
		t.Parallel()

		var capturedHeaders http.Header

		webhookMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				capturedHeaders = headers
				return nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return &models.User{
					ID:         "uuid",
					CreatedAt:  time.Now(),
					UpdatedAt:  time.Now(),
					CreateUser: *user,
				}, nil
			},
		}

		app := fiber.New()
		h := handler.NewClerkWebHookHandler(userMock, webhookMock)
		app.Post("/webhook", h.CreateUser)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("svix-id", "msg_abc")
		req.Header.Set("svix-timestamp", "1234567890")
		req.Header.Set("svix-signature", "v1,signature123")

		_, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, "msg_abc", capturedHeaders.Get("svix-id"))
		assert.Equal(t, "1234567890", capturedHeaders.Get("svix-timestamp"))
		assert.Equal(t, "v1,signature123", capturedHeaders.Get("svix-signature"))
	})

	t.Run("sets profile picture when has_image is true", func(t *testing.T) {
		t.Parallel()

		var capturedUser *models.CreateUser

		webhookMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				return nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				capturedUser = user
				return &models.User{
					ID:         "uuid",
					CreatedAt:  time.Now(),
					UpdatedAt:  time.Now(),
					CreateUser: *user,
				}, nil
			},
		}

		app := fiber.New()
		h := handler.NewClerkWebHookHandler(userMock, webhookMock)
		app.Post("/webhook", h.CreateUser)

		payloadWithImage := `{
			"type": "user.created",
			"data": {
				"id": "user_123",
				"first_name": "John",
				"last_name": "Doe",
				"has_image": true,
				"image_url": "https://example.com/photo.jpg"
			}
		}`

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(payloadWithImage))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("svix-id", "msg_123")
		req.Header.Set("svix-timestamp", "1614265330")
		req.Header.Set("svix-signature", "v1,valid")

		_, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, "https://example.com/photo.jpg", *capturedUser.ProfilePicture)
	})
}
