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

const testUserID = "user_test_123"

type mockNotificationsRepository struct {
	findByUserIDFunc      func(ctx context.Context, userID string) ([]*models.Notification, error)
	markReadFunc          func(ctx context.Context, id, userID string) error
	markAllReadFunc       func(ctx context.Context, userID string) error
	upsertDeviceTokenFunc func(ctx context.Context, userID, token, platform string) error
}

func (m *mockNotificationsRepository) FindByUserID(ctx context.Context, userID string) ([]*models.Notification, error) {
	if m.findByUserIDFunc != nil {
		return m.findByUserIDFunc(ctx, userID)
	}
	return nil, nil
}

func (m *mockNotificationsRepository) MarkRead(ctx context.Context, id, userID string) error {
	if m.markReadFunc != nil {
		return m.markReadFunc(ctx, id, userID)
	}
	return nil
}

func (m *mockNotificationsRepository) MarkAllRead(ctx context.Context, userID string) error {
	if m.markAllReadFunc != nil {
		return m.markAllReadFunc(ctx, userID)
	}
	return nil
}

func (m *mockNotificationsRepository) UpsertDeviceToken(ctx context.Context, userID, token, platform string) error {
	if m.upsertDeviceTokenFunc != nil {
		return m.upsertDeviceTokenFunc(ctx, userID, token, platform)
	}
	return nil
}

// notifApp builds a test Fiber app with the userId local pre-set (simulating
// the Clerk auth middleware) and all notification routes registered.
func notifApp(h *NotificationsHandler) *fiber.App {
	app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("userId", testUserID)
		return c.Next()
	})
	app.Get("/notifications", h.ListNotifications)
	app.Put("/notifications/read-all", h.MarkAllRead)
	app.Put("/notifications/:id/read", h.MarkRead)
	app.Post("/device-tokens", h.RegisterDeviceToken)
	return app
}

func TestNotificationsHandler_ListNotifications(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with notifications", func(t *testing.T) {
		t.Parallel()

		readAt := time.Now()
		mock := &mockNotificationsRepository{
			findByUserIDFunc: func(ctx context.Context, userID string) ([]*models.Notification, error) {
				return []*models.Notification{
					{
						ID:        "notif-1",
						UserID:    userID,
						Type:      models.TypeTaskAssigned,
						Title:     "New task assigned to you",
						Body:      "Room cleaning",
						ReadAt:    &readAt,
						CreatedAt: time.Now(),
					},
				}, nil
			},
		}

		req := httptest.NewRequest("GET", "/notifications", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "notif-1")
		assert.Contains(t, string(body), "New task assigned to you")
	})

	t.Run("returns 200 with empty array when no notifications", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			findByUserIDFunc: func(ctx context.Context, userID string) ([]*models.Notification, error) {
				return nil, nil
			},
		}

		req := httptest.NewRequest("GET", "/notifications", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "[]")
	})

	t.Run("passes userId from locals to repository", func(t *testing.T) {
		t.Parallel()

		var capturedUserID string
		mock := &mockNotificationsRepository{
			findByUserIDFunc: func(ctx context.Context, userID string) ([]*models.Notification, error) {
				capturedUserID = userID
				return nil, nil
			},
		}

		req := httptest.NewRequest("GET", "/notifications", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		assert.Equal(t, testUserID, capturedUserID)
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			findByUserIDFunc: func(ctx context.Context, userID string) ([]*models.Notification, error) {
				return nil, errors.New("db error")
			},
		}

		req := httptest.NewRequest("GET", "/notifications", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestNotificationsHandler_MarkRead(t *testing.T) {
	t.Parallel()

	t.Run("returns 204 on success", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			markReadFunc: func(ctx context.Context, id, userID string) error {
				return nil
			},
		}

		req := httptest.NewRequest("PUT", "/notifications/notif-123/read", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 204, resp.StatusCode)
	})

	t.Run("passes correct id and userId to repository", func(t *testing.T) {
		t.Parallel()

		var capturedID, capturedUserID string
		mock := &mockNotificationsRepository{
			markReadFunc: func(ctx context.Context, id, userID string) error {
				capturedID = id
				capturedUserID = userID
				return nil
			},
		}

		req := httptest.NewRequest("PUT", "/notifications/notif-abc/read", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 204, resp.StatusCode)
		assert.Equal(t, "notif-abc", capturedID)
		assert.Equal(t, testUserID, capturedUserID)
	})

	t.Run("returns 404 when notification not found or already read", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			markReadFunc: func(ctx context.Context, id, userID string) error {
				return errs.ErrNotFoundInDB
			},
		}

		req := httptest.NewRequest("PUT", "/notifications/notif-missing/read", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			markReadFunc: func(ctx context.Context, id, userID string) error {
				return errors.New("db error")
			},
		}

		req := httptest.NewRequest("PUT", "/notifications/notif-123/read", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestNotificationsHandler_MarkAllRead(t *testing.T) {
	t.Parallel()

	t.Run("returns 204 on success", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			markAllReadFunc: func(ctx context.Context, userID string) error {
				return nil
			},
		}

		req := httptest.NewRequest("PUT", "/notifications/read-all", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 204, resp.StatusCode)
	})

	t.Run("passes userId from locals to repository", func(t *testing.T) {
		t.Parallel()

		var capturedUserID string
		mock := &mockNotificationsRepository{
			markAllReadFunc: func(ctx context.Context, userID string) error {
				capturedUserID = userID
				return nil
			},
		}

		req := httptest.NewRequest("PUT", "/notifications/read-all", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 204, resp.StatusCode)
		assert.Equal(t, testUserID, capturedUserID)
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			markAllReadFunc: func(ctx context.Context, userID string) error {
				return errors.New("db error")
			},
		}

		req := httptest.NewRequest("PUT", "/notifications/read-all", nil)
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestNotificationsHandler_RegisterDeviceToken(t *testing.T) {
	t.Parallel()

	t.Run("returns 204 on success for ios", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			upsertDeviceTokenFunc: func(ctx context.Context, userID, token, platform string) error {
				return nil
			},
		}

		body := `{"token": "ExponentPushToken[xxx]", "platform": "ios"}`
		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 204, resp.StatusCode)
	})

	t.Run("returns 204 on success for android", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			upsertDeviceTokenFunc: func(ctx context.Context, userID, token, platform string) error {
				return nil
			},
		}

		body := `{"token": "ExponentPushToken[yyy]", "platform": "android"}`
		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 204, resp.StatusCode)
	})

	t.Run("passes correct userId, token and platform to repository", func(t *testing.T) {
		t.Parallel()

		var capturedUserID, capturedToken, capturedPlatform string
		mock := &mockNotificationsRepository{
			upsertDeviceTokenFunc: func(ctx context.Context, userID, token, platform string) error {
				capturedUserID = userID
				capturedToken = token
				capturedPlatform = platform
				return nil
			},
		}

		body := `{"token": "ExponentPushToken[yyy]", "platform": "android"}`
		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 204, resp.StatusCode)
		assert.Equal(t, testUserID, capturedUserID)
		assert.Equal(t, "ExponentPushToken[yyy]", capturedToken)
		assert.Equal(t, "android", capturedPlatform)
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(`{invalid`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(&mockNotificationsRepository{})).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when token is missing", func(t *testing.T) {
		t.Parallel()

		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(`{"platform": "ios"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(&mockNotificationsRepository{})).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "token")
	})

	t.Run("returns 400 when platform is missing", func(t *testing.T) {
		t.Parallel()

		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(`{"token": "ExponentPushToken[abc]"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(&mockNotificationsRepository{})).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "platform")
	})

	t.Run("returns 400 when platform is invalid", func(t *testing.T) {
		t.Parallel()

		body := `{"token": "ExponentPushToken[zzz]", "platform": "windows"}`
		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(&mockNotificationsRepository{})).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
		respBody, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(respBody), "platform")
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockNotificationsRepository{
			upsertDeviceTokenFunc: func(ctx context.Context, userID, token, platform string) error {
				return errors.New("db error")
			},
		}

		body := `{"token": "ExponentPushToken[xxx]", "platform": "ios"}`
		req := httptest.NewRequest("POST", "/device-tokens", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := notifApp(NewNotificationsHandler(mock)).Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}
