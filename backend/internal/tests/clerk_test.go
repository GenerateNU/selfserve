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
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
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
func (m *mockUsersRepositoryClerk) BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error {
	return nil
}
func (m *mockUsersRepositoryClerk) FindUser(ctx context.Context, id string) (*models.User, error) {
	return nil, nil
}
func (m *mockUsersRepositoryClerk) UpdateProfilePicture(ctx context.Context, userId string, key string) error {
	return nil
}
func (m *mockUsersRepositoryClerk) DeleteProfilePicture(ctx context.Context, userId string) error {
	return nil
}
func (m *mockUsersRepositoryClerk) GetKey(ctx context.Context, userId string) (string, error) {
	return "", nil
}
func (m *mockUsersRepositoryClerk) UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error) {
	return nil, nil
}
func (m *mockUsersRepositoryClerk) SearchUsersByHotel(ctx context.Context, hotelID, cursor, query string, limit int) ([]*models.User, string, error) {
	return nil, "", nil
}

var _ storage.UsersRepository = (*mockUsersRepositoryClerk)(nil)

type mockHotelsRepositoryClerk struct {
	findByClerkOrgIDFunc        func(ctx context.Context, clerkOrgID string) (*models.Hotel, error)
	insertHotelFromClerkOrgFunc func(ctx context.Context, clerkOrgID string, name string) (*models.Hotel, error)
}

func (m *mockHotelsRepositoryClerk) FindByID(ctx context.Context, id string) (*models.Hotel, error) {
	return nil, nil
}
func (m *mockHotelsRepositoryClerk) InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error) {
	return nil, nil
}
func (m *mockHotelsRepositoryClerk) FindByClerkOrgID(ctx context.Context, clerkOrgID string) (*models.Hotel, error) {
	if m.findByClerkOrgIDFunc != nil {
		return m.findByClerkOrgIDFunc(ctx, clerkOrgID)
	}
	return nil, nil
}
func (m *mockHotelsRepositoryClerk) InsertHotelFromClerkOrg(ctx context.Context, clerkOrgID string, name string) (*models.Hotel, error) {
	if m.insertHotelFromClerkOrgFunc != nil {
		return m.insertHotelFromClerkOrgFunc(ctx, clerkOrgID, name)
	}
	return nil, nil
}

var _ storage.HotelsRepository = (*mockHotelsRepositoryClerk)(nil)

func validVerifier() *mockWebhookVerifier {
	return &mockWebhookVerifier{
		verifyFunc: func(payload []byte, headers http.Header) error { return nil },
	}
}

func invalidVerifier() *mockWebhookVerifier {
	return &mockWebhookVerifier{
		verifyFunc: func(payload []byte, headers http.Header) error {
			return errors.New("invalid signature")
		},
	}
}

func svixHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("svix-id", "msg_123")
	req.Header.Set("svix-timestamp", "1614265330")
	req.Header.Set("svix-signature", "v1,valid")
}

func TestClerkHandler_OrgCreated(t *testing.T) {
	t.Parallel()

	validPayload := `{
		"data": {
			"id": "org_123",
			"name": "Hotel California"
		}
	}`

	t.Run("returns 401 when signature verification fails", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, &mockHotelsRepositoryClerk{}, invalidVerifier())
		app.Post("/webhook", h.OrgCreated)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 200 and creates hotel when org is created", func(t *testing.T) {
		t.Parallel()

		var capturedOrgID, capturedName string
		hotelMock := &mockHotelsRepositoryClerk{
			insertHotelFromClerkOrgFunc: func(ctx context.Context, clerkOrgID string, name string) (*models.Hotel, error) {
				capturedOrgID = clerkOrgID
				capturedName = name
				return &models.Hotel{}, nil
			},
		}

		app := fiber.New()
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, hotelMock, validVerifier())
		app.Post("/webhook", h.OrgCreated)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		assert.Equal(t, "org_123", capturedOrgID)
		assert.Equal(t, "Hotel California", capturedName)
	})

	t.Run("returns 200 when hotel already exists (idempotent)", func(t *testing.T) {
		t.Parallel()

		hotelMock := &mockHotelsRepositoryClerk{
			insertHotelFromClerkOrgFunc: func(ctx context.Context, clerkOrgID string, name string) (*models.Hotel, error) {
				return nil, errs.ErrAlreadyExistsInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, hotelMock, validVerifier())
		app.Post("/webhook", h.OrgCreated)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 400 when payload is invalid JSON", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, &mockHotelsRepositoryClerk{}, validVerifier())
		app.Post("/webhook", h.OrgCreated)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(`{invalid`))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		hotelMock := &mockHotelsRepositoryClerk{
			insertHotelFromClerkOrgFunc: func(ctx context.Context, clerkOrgID string, name string) (*models.Hotel, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, hotelMock, validVerifier())
		app.Post("/webhook", h.OrgCreated)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestClerkHandler_CreateOrgMembership(t *testing.T) {
	t.Parallel()

	validPayload := `{
		"data": {
			"organization": {
				"id": "org_123",
				"name": "Hotel California"
			},
			"public_user_data": {
				"user_id": "user_123",
				"first_name": "John",
				"last_name": "Doe",
				"has_image": false,
				"image_url": null
			}
		}
	}`

	hotelID := "550e8400-e29b-41d4-a716-446655440000"

	t.Run("returns 401 when signature verification fails", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, &mockHotelsRepositoryClerk{}, invalidVerifier())
		app.Post("/webhook", h.CreateOrgMembership)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 200 and creates user when membership is created", func(t *testing.T) {
		t.Parallel()

		var capturedUser *models.CreateUser

		hotelMock := &mockHotelsRepositoryClerk{
			findByClerkOrgIDFunc: func(ctx context.Context, clerkOrgID string) (*models.Hotel, error) {
				return &models.Hotel{
					ID:                 hotelID,
					CreateHotelRequest: models.CreateHotelRequest{Name: "Hotel California"},
				}, nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				capturedUser = user
				return &models.User{
					CreatedAt:  time.Now(),
					UpdatedAt:  time.Now(),
					CreateUser: *user,
				}, nil
			},
		}

		app := fiber.New()
		h := handler.NewClerkWebHookHandler(userMock, hotelMock, validVerifier())
		app.Post("/webhook", h.CreateOrgMembership)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		assert.Equal(t, "user_123", capturedUser.ID)
		assert.Equal(t, "John", capturedUser.FirstName)
		assert.Equal(t, "Doe", capturedUser.LastName)
		assert.Equal(t, hotelID, capturedUser.HotelID)
	})

	t.Run("returns 503 when hotel not found so clerk retries", func(t *testing.T) {
		t.Parallel()

		hotelMock := &mockHotelsRepositoryClerk{
			findByClerkOrgIDFunc: func(ctx context.Context, clerkOrgID string) (*models.Hotel, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, hotelMock, validVerifier())
		app.Post("/webhook", h.CreateOrgMembership)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 503, resp.StatusCode)
	})

	t.Run("returns 400 when payload is invalid JSON", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(&mockUsersRepositoryClerk{}, &mockHotelsRepositoryClerk{}, validVerifier())
		app.Post("/webhook", h.CreateOrgMembership)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(`{invalid`))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 500 when user insertion fails", func(t *testing.T) {
		t.Parallel()

		hotelMock := &mockHotelsRepositoryClerk{
			findByClerkOrgIDFunc: func(ctx context.Context, clerkOrgID string) (*models.Hotel, error) {
				return &models.Hotel{ID: hotelID}, nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return nil, errors.New("db error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := handler.NewClerkWebHookHandler(userMock, hotelMock, validVerifier())
		app.Post("/webhook", h.CreateOrgMembership)

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(validPayload))
		svixHeaders(req)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("sets profile picture when has_image is true", func(t *testing.T) {
		t.Parallel()

		var capturedUser *models.CreateUser

		hotelMock := &mockHotelsRepositoryClerk{
			findByClerkOrgIDFunc: func(ctx context.Context, clerkOrgID string) (*models.Hotel, error) {
				return &models.Hotel{ID: hotelID}, nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				capturedUser = user
				return &models.User{CreatedAt: time.Now(), UpdatedAt: time.Now(), CreateUser: *user}, nil
			},
		}

		app := fiber.New()
		h := handler.NewClerkWebHookHandler(userMock, hotelMock, validVerifier())
		app.Post("/webhook", h.CreateOrgMembership)

		payloadWithImage := `{
			"data": {
				"organization": {
					"id": "org_123",
					"name": "Hotel California"
				},
				"public_user_data": {
					"user_id": "user_123",
					"first_name": "John",
					"last_name": "Doe",
					"has_image": true,
					"image_url": "https://example.com/photo.jpg"
				}
			}
		}`

		req := httptest.NewRequest("POST", "/webhook", bytes.NewBufferString(payloadWithImage))
		svixHeaders(req)

		_, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, "https://example.com/photo.jpg", *capturedUser.ProfilePicture)
	})

	t.Run("passes correct headers to verifier", func(t *testing.T) {
		t.Parallel()

		var capturedHeaders http.Header

		verifierMock := &mockWebhookVerifier{
			verifyFunc: func(payload []byte, headers http.Header) error {
				capturedHeaders = headers
				return nil
			},
		}

		hotelMock := &mockHotelsRepositoryClerk{
			findByClerkOrgIDFunc: func(ctx context.Context, clerkOrgID string) (*models.Hotel, error) {
				return &models.Hotel{ID: hotelID}, nil
			},
		}

		userMock := &mockUsersRepositoryClerk{
			insertUserFunc: func(ctx context.Context, user *models.CreateUser) (*models.User, error) {
				return &models.User{CreatedAt: time.Now(), UpdatedAt: time.Now(), CreateUser: *user}, nil
			},
		}

		app := fiber.New()
		h := handler.NewClerkWebHookHandler(userMock, hotelMock, verifierMock)
		app.Post("/webhook", h.CreateOrgMembership)

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
}
