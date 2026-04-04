package handler

import (
	"context"
	"encoding/json"
	"io"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockAuthUsers struct {
	findUser func(ctx context.Context, id string) (*models.User, error)
}

func (m *mockAuthUsers) FindUser(ctx context.Context, id string) (*models.User, error) {
	if m.findUser == nil {
		h := "521e8400-e458-41d4-a716-446655440000"
		return &models.User{CreateUser: models.CreateUser{ID: id, HotelID: &h}}, nil
	}
	return m.findUser(ctx, id)
}

func testTasksApp(t *testing.T, repo *mockRequestRepository, users *mockAuthUsers, localsUserID string) *fiber.App {
	t.Helper()
	app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
	if localsUserID != "" {
		app.Use(func(c *fiber.Ctx) error {
			c.Locals("userId", localsUserID)
			return c.Next()
		})
	}
	h := NewTasksHandler(repo, users)
	app.Get("/tasks", h.GetTasks)
	app.Post("/tasks", h.CreateTask)
	app.Patch("/tasks/:id", h.PatchTask)
	app.Post("/tasks/:id/claim", h.ClaimTask)
	app.Post("/tasks/:id/drop", h.DropTask)
	return app
}

func TestTasksHandler_GetTasks(t *testing.T) {
	t.Parallel()

	t.Run("returns 401 when userId missing", func(t *testing.T) {
		t.Parallel()
		app := testTasksApp(t, &mockRequestRepository{}, &mockAuthUsers{}, "")
		req := httptest.NewRequest("GET", "/tasks?tab=my", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 400 when user has no hotel", func(t *testing.T) {
		t.Parallel()
		app := testTasksApp(t, &mockRequestRepository{}, &mockAuthUsers{
			findUser: func(ctx context.Context, id string) (*models.User, error) {
				return &models.User{CreateUser: models.CreateUser{ID: id, HotelID: nil}}, nil
			},
		}, "user_clerk_1")
		req := httptest.NewRequest("GET", "/tasks?tab=my", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when tab missing", func(t *testing.T) {
		t.Parallel()
		app := testTasksApp(t, &mockRequestRepository{}, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("GET", "/tasks", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when cursor tab mismatches", func(t *testing.T) {
		t.Parallel()
		cur, err := utils.EncodeTaskCursor(models.TaskTabUnassigned, 2, "hk", time.Now().UTC(), "00000000-0000-0000-0000-000000000099")
		require.NoError(t, err)
		app := testTasksApp(t, &mockRequestRepository{}, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("GET", "/tasks?tab=my&cursor="+cur, nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 200 with items", func(t *testing.T) {
		t.Parallel()
		ts := time.Date(2025, 3, 1, 12, 0, 0, 0, time.UTC)
		dept := "Housekeeping"
		task := models.Task{
			ID: "00000000-0000-0000-0000-0000000000aa", Title: "Clean", Priority: "high",
			Department: &dept, Location: "Room 101", Status: "assigned", IsAssigned: true,
		}
		cur, err := utils.EncodeTaskCursor(models.TaskTabMy, utils.PriorityRank("high"), utils.DepartmentKey(&dept), ts, task.ID)
		require.NoError(t, err)
		task.Cursor = cur

		repo := &mockRequestRepository{
			findTasksFunc: func(ctx context.Context, hotelID, clerkUserID string, filter models.TaskFilter, cursorRank int, cursorDeptKey string, cursorCreatedAt time.Time, cursorID string, hasCursor bool) ([]models.Task, error) {
				assert.Equal(t, "521e8400-e458-41d4-a716-446655440000", hotelID)
				assert.Equal(t, "user_clerk_1", clerkUserID)
				assert.Equal(t, models.TaskTabMy, filter.Tab)
				return []models.Task{task}, nil
			},
		}
		app := testTasksApp(t, repo, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("GET", "/tasks?tab=my&limit=20", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"items"`)
		assert.Contains(t, string(body), "Clean")
		assert.Contains(t, string(body), `"has_more":false`)
	})
}

func TestTasksHandler_CreateTask(t *testing.T) {
	t.Parallel()

	t.Run("returns 200", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				assert.Equal(t, "adhoc", req.RequestType)
				assert.Equal(t, string(models.StatusPending), req.Status)
				req.CreatedAt = time.Now()
				req.RequestVersion = time.Now()
				return req, nil
			},
		}
		app := testTasksApp(t, repo, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("POST", "/tasks", strings.NewReader(`{"name":"Quick task"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})
}

func TestTasksHandler_PatchTask(t *testing.T) {
	t.Parallel()
	rid := "530e8400-e458-41d4-a716-446655440000"

	t.Run("returns 409 on state conflict", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			updateTaskStatusFunc: func(ctx context.Context, hotelID, requestID, clerkUserID, newStatus string) error {
				return errs.ErrTaskStateConflict
			},
		}
		app := testTasksApp(t, repo, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("PATCH", "/tasks/"+rid, strings.NewReader(`{"status":"completed"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 409, resp.StatusCode)
	})

	t.Run("returns 404 when not found", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			updateTaskStatusFunc: func(ctx context.Context, hotelID, requestID, clerkUserID, newStatus string) error {
				return errs.ErrNotFoundInDB
			},
		}
		app := testTasksApp(t, repo, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("PATCH", "/tasks/"+rid, strings.NewReader(`{"status":"completed"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 200", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			updateTaskStatusFunc: func(ctx context.Context, hotelID, requestID, clerkUserID, newStatus string) error {
				return nil
			},
			findRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return &models.Request{
					ID: id, CreatedAt: time.Now(), RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID: "521e8400-e458-41d4-a716-446655440000", Name: "x", RequestType: "adhoc",
						Status: "completed", Priority: "low", Notes: ptrStr(""),
					},
				}, nil
			},
		}
		app := testTasksApp(t, repo, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("PATCH", "/tasks/"+rid, strings.NewReader(`{"status":"completed"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})
}

func ptrStr(s string) *string { return &s }

func TestTasksHandler_ClaimTask(t *testing.T) {
	t.Parallel()
	rid := "530e8400-e458-41d4-a716-446655440000"

	t.Run("returns 409 on conflict", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			claimTaskFunc: func(ctx context.Context, hotelID, requestID, clerkUserID string) error {
				return errs.ErrTaskStateConflict
			},
		}
		app := testTasksApp(t, repo, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("POST", "/tasks/"+rid+"/claim", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 409, resp.StatusCode)
	})
}

func TestTasksHandler_DropTask(t *testing.T) {
	t.Parallel()
	rid := "530e8400-e458-41d4-a716-446655440000"

	t.Run("returns 409 on conflict", func(t *testing.T) {
		t.Parallel()
		repo := &mockRequestRepository{
			dropTaskFunc: func(ctx context.Context, hotelID, requestID, clerkUserID string) error {
				return errs.ErrTaskStateConflict
			},
		}
		app := testTasksApp(t, repo, &mockAuthUsers{}, "user_clerk_1")
		req := httptest.NewRequest("POST", "/tasks/"+rid+"/drop", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 409, resp.StatusCode)
	})
}

func TestTaskCursorRoundTrip(t *testing.T) {
	t.Parallel()
	ts := time.Date(2025, 1, 2, 3, 4, 5, 0, time.UTC)
	cur, err := utils.EncodeTaskCursor(models.TaskTabMy, 3, "dept", ts, "11111111-1111-1111-1111-111111111111")
	require.NoError(t, err)
	pr, dk, ca, id, err := utils.DecodeTaskCursor(cur, models.TaskTabMy)
	require.NoError(t, err)
	assert.Equal(t, 3, pr)
	assert.Equal(t, "dept", dk)
	assert.True(t, ca.Equal(ts))
	assert.Equal(t, "11111111-1111-1111-1111-111111111111", id)
}

func TestTaskCursorWrongTab(t *testing.T) {
	t.Parallel()
	cur, err := utils.EncodeTaskCursor(models.TaskTabMy, 1, "", time.Now(), "11111111-1111-1111-1111-111111111111")
	require.NoError(t, err)
	_, _, _, _, err = utils.DecodeTaskCursor(cur, models.TaskTabUnassigned)
	assert.Error(t, err)
}

// Ensure CursorPage JSON shape for mobile.
func TestCursorPageTasksJSON(t *testing.T) {
	t.Parallel()
	p := utils.CursorPage[models.Task]{
		Items:   []models.Task{{ID: "a", Title: "t", Location: "x", Status: "pending", IsAssigned: false}},
		HasMore: false,
	}
	b, err := json.Marshal(p)
	require.NoError(t, err)
	assert.Contains(t, string(b), `"next_cursor":null`)
}
