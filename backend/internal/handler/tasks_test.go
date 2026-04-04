package handler

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockTaskAuthLookup struct {
	hotelID string
	findErr error
	noHotel bool
}

func (m *mockTaskAuthLookup) FindUser(ctx context.Context, id string) (*models.User, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	if m.noHotel {
		return &models.User{CreateUser: models.CreateUser{ID: id, HotelID: nil}}, nil
	}
	hid := m.hotelID
	return &models.User{CreateUser: models.CreateUser{ID: id, HotelID: &hid}}, nil
}

func withTasksAuth(app *fiber.App, userID string) {
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("userId", userID)
		return c.Next()
	})
}

func TestTasksHandler_GetTasks(t *testing.T) {
	t.Parallel()

	hotel := "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
	user := "user_clerk_test"

	t.Run("returns 200 for unassigned tab", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			findTasksFunc: func(ctx context.Context, hotelID string, uid string, filter *models.TaskFilter, cursor *models.TaskCursor) ([]*models.Task, error) {
				assert.Equal(t, hotel, hotelID)
				assert.Equal(t, "", uid)
				return []*models.Task{{ID: "t1", Title: "x", Status: "pending"}}, nil
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Get("/tasks", h.GetTasks)

		req := httptest.NewRequest(http.MethodGet, "/tasks?tab=unassigned", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "t1")
	})

	t.Run("returns 200 for my tab", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			findTasksFunc: func(ctx context.Context, hotelID string, uid string, filter *models.TaskFilter, cursor *models.TaskCursor) ([]*models.Task, error) {
				assert.Equal(t, hotel, hotelID)
				assert.Equal(t, user, uid)
				return []*models.Task{}, nil
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Get("/tasks", h.GetTasks)

		req := httptest.NewRequest(http.MethodGet, "/tasks?tab=my", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 401 without auth context", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Get("/tasks", h.GetTasks)

		req := httptest.NewRequest(http.MethodGet, "/tasks?tab=unassigned", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 401, resp.StatusCode)
	})
}

func TestTasksHandler_CreateTask(t *testing.T) {
	t.Parallel()

	hotel := "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
	user := "user_clerk_test"

	t.Run("returns id on success", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				assert.NotEmpty(t, req.ID)
				assert.Equal(t, hotel, req.HotelID)
				return &models.Request{ID: req.ID, MakeRequest: req.MakeRequest}, nil
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Post("/tasks", h.CreateTask)

		body := bytes.NewBufferString(`{"name":"Test task","assign_to_me":false}`)
		req := httptest.NewRequest(http.MethodPost, "/tasks", body)
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		b, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(b), `"id"`)
	})

	t.Run("assign_to_me sets user id", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				require.NotNil(t, req.UserID)
				assert.Equal(t, user, *req.UserID)
				return &models.Request{ID: req.ID, MakeRequest: req.MakeRequest}, nil
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Post("/tasks", h.CreateTask)

		body := bytes.NewBufferString(`{"name":"Mine","assign_to_me":true}`)
		req := httptest.NewRequest(http.MethodPost, "/tasks", body)
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})
}

func TestTasksHandler_ClaimTask(t *testing.T) {
	t.Parallel()

	hotel := "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
	user := "user_clerk_test"
	taskID := "f0000001-0000-0000-0000-000000000001"

	t.Run("returns 204 on success", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			claimTaskFunc: func(ctx context.Context, hid, tid, staff string) error {
				assert.Equal(t, hotel, hid)
				assert.Equal(t, taskID, tid)
				assert.Equal(t, user, staff)
				return nil
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Post("/tasks/:id/claim", h.ClaimTask)

		req := httptest.NewRequest(http.MethodPost, "/tasks/"+taskID+"/claim", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 204, resp.StatusCode)
	})

	t.Run("returns 409 when claim conflicts", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			claimTaskFunc: func(ctx context.Context, hotelID, taskID, staffUserID string) error {
				return errs.ErrTaskStateConflict
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Post("/tasks/:id/claim", h.ClaimTask)

		req := httptest.NewRequest(http.MethodPost, "/tasks/"+taskID+"/claim", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 409, resp.StatusCode)
	})

	t.Run("returns 404 when task missing", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			claimTaskFunc: func(ctx context.Context, hotelID, taskID, staffUserID string) error {
				return errs.ErrNotFoundInDB
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Post("/tasks/:id/claim", h.ClaimTask)

		req := httptest.NewRequest(http.MethodPost, "/tasks/"+taskID+"/claim", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})
}

func TestTasksHandler_DropTask(t *testing.T) {
	t.Parallel()

	hotel := "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
	user := "user_clerk_test"
	taskID := "f0000001-0000-0000-0000-000000000001"

	t.Run("returns 204 on success", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			dropTaskFunc: func(ctx context.Context, hid, tid, staff string) error {
				assert.Equal(t, user, staff)
				return nil
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Post("/tasks/:id/drop", h.DropTask)

		req := httptest.NewRequest(http.MethodPost, "/tasks/"+taskID+"/drop", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 204, resp.StatusCode)
	})

	t.Run("returns 409 when drop conflicts", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			dropTaskFunc: func(ctx context.Context, hotelID, taskID, staffUserID string) error {
				return errs.ErrTaskStateConflict
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Post("/tasks/:id/drop", h.DropTask)

		req := httptest.NewRequest(http.MethodPost, "/tasks/"+taskID+"/drop", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 409, resp.StatusCode)
	})
}

func TestTasksHandler_PatchTask(t *testing.T) {
	t.Parallel()

	hotel := "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
	user := "user_clerk_test"
	taskID := "f0000001-0000-0000-0000-000000000001"

	t.Run("returns 204 on success", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			updateTaskStatusFunc: func(ctx context.Context, hid, tid, status string) error {
				assert.Equal(t, "completed", status)
				return nil
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Patch("/tasks/:id", h.PatchTask)

		body := bytes.NewBufferString(`{"status":"completed"}`)
		req := httptest.NewRequest(http.MethodPatch, "/tasks/"+taskID, body)
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 204, resp.StatusCode)
	})

	t.Run("returns 400 for invalid status", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Patch("/tasks/:id", h.PatchTask)

		body := bytes.NewBufferString(`{"status":"bogus"}`)
		req := httptest.NewRequest(http.MethodPatch, "/tasks/"+taskID, body)
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 404 when task missing", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			updateTaskStatusFunc: func(ctx context.Context, hotelID, taskID, status string) error {
				return errs.ErrNotFoundInDB
			},
		}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withTasksAuth(app, user)
		h := NewTasksHandler(repo, &mockTaskAuthLookup{hotelID: hotel})
		app.Patch("/tasks/:id", h.PatchTask)

		body := bytes.NewBufferString(`{"status":"completed"}`)
		req := httptest.NewRequest(http.MethodPatch, "/tasks/"+taskID, body)
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})
}
