
package main

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/generate/selfserve/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockUsersRepositorySync struct {
	bulkInsertFunc func(ctx context.Context, users []*models.CreateUser) error
}

func (m *mockUsersRepositorySync) InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error) {
	return nil, nil
}

func (m *mockUsersRepositorySync) BulkInsertUsers(ctx context.Context, users []*models.CreateUser) error {
	return m.bulkInsertFunc(ctx, users)
}

func TestSyncUsers(t *testing.T) {
	t.Parallel()

	t.Run("successfully syncs valid users from Clerk", func(t *testing.T) {
		t.Parallel()

		var capturedUsers []*models.CreateUser

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			assert.Contains(t, r.Header.Get("Authorization"), "Bearer ")

			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`[
				{
					"id": "user_123",
					"first_name": "John",
					"last_name": "Doe",
					"has_image": false,
					"image_url": null
				},
				{
					"id": "user_456",
					"first_name": "Jane",
					"last_name": "Smith",
					"has_image": true,
					"image_url": "https://example.com/jane.jpg"
				}
			]`))
		}))
		defer server.Close()

		userMock := &mockUsersRepositorySync{
			bulkInsertFunc: func(ctx context.Context, users []*models.CreateUser) error {
				capturedUsers = users
				return nil
			},
		}

		err := syncUsers(context.Background(), server.URL, "test_secret", userMock)
		require.NoError(t, err)

		assert.Len(t, capturedUsers, 2)
		assert.Equal(t, "user_123", capturedUsers[0].ID)
		assert.Equal(t, "John", capturedUsers[0].FirstName)
		assert.Equal(t, "Doe", capturedUsers[0].LastName)
		assert.Nil(t, capturedUsers[0].ProfilePicture)
		assert.Equal(t, "user_456", capturedUsers[1].ID)
		assert.Equal(t, "Jane", capturedUsers[1].FirstName)
		assert.Equal(t, "Smith", capturedUsers[1].LastName)
		assert.Equal(t, "https://example.com/jane.jpg", *capturedUsers[1].ProfilePicture)
	})

	t.Run("returns error when Clerk API fails", func(t *testing.T) {
		t.Parallel()

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusUnauthorized)
		}))
		defer server.Close()

		userMock := &mockUsersRepositorySync{
			bulkInsertFunc: func(ctx context.Context, users []*models.CreateUser) error {
				return nil
			},
		}

		err := syncUsers(context.Background(), server.URL, "bad_secret", userMock)
		require.Error(t, err)
	})

	t.Run("returns error when validation fails", func(t *testing.T) {
		t.Parallel()

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`[
				{
					"id": "",
					"first_name": "",
					"last_name": "",
					"has_image": false
				}
			]`))
		}))
		defer server.Close()

		userMock := &mockUsersRepositorySync{
			bulkInsertFunc: func(ctx context.Context, users []*models.CreateUser) error {
				return nil
			},
		}

		err := syncUsers(context.Background(), server.URL, "test_secret", userMock)
		require.Error(t, err)
	})

	t.Run("returns error when bulk insert fails", func(t *testing.T) {
		t.Parallel()

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`[
				{
					"id": "user_123",
					"first_name": "John",
					"last_name": "Doe",
					"has_image": false
				}
			]`))
		}))
		defer server.Close()

		userMock := &mockUsersRepositorySync{
			bulkInsertFunc: func(ctx context.Context, users []*models.CreateUser) error {
				return errors.New("db connection failed")
			},
		}

		err := syncUsers(context.Background(), server.URL, "test_secret", userMock)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "db connection failed")
	})

	t.Run("handles empty user list from Clerk", func(t *testing.T) {
		t.Parallel()

		var insertCalled bool

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`[]`))
		}))
		defer server.Close()

		userMock := &mockUsersRepositorySync{
			bulkInsertFunc: func(ctx context.Context, users []*models.CreateUser) error {
				insertCalled = true
				return nil
			},
		}

		err := syncUsers(context.Background(), server.URL, "test_secret", userMock)
		require.NoError(t, err)
		assert.True(t, insertCalled)
	})
}
