package handler

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
)

const devUserIDHeader = "X-Dev-User-Id"
// TODO(production): Remove X-Dev-User-Id fallback once backend auth middleware
// always provides a verified staff identity.

type staffUserIDResolver interface {
	ResolveStaffUserIDForRequests(ctx context.Context, header string) (string, error)
}

type TasksHandler struct {
	repo  storage.RequestsRepository
	users staffUserIDResolver
}

func NewTasksHandler(repo storage.RequestsRepository, users staffUserIDResolver) *TasksHandler {
	return &TasksHandler{repo: repo, users: users}
}

// GetTasks returns a cursor page of tasks for the hotel, scoped by tab (my vs unassigned).
func (h *TasksHandler) GetTasks(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	filter := new(models.TaskFilter)
	if err := c.QueryParser(filter); err != nil {
		return errs.BadRequest("invalid query parameters")
	}

	tab := models.TaskTab(strings.TrimSpace(filter.Tab))
	if tab != models.TaskTabMy && tab != models.TaskTabUnassigned {
		return errs.BadRequest("tab must be my or unassigned")
	}

	headerUser := strings.TrimSpace(c.Get(devUserIDHeader))
	if tab == models.TaskTabMy && headerUser == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "sign in required for my tasks",
		})
	}

	var userID string
	if tab == models.TaskTabMy {
		resolved, resErr := h.users.ResolveStaffUserIDForRequests(c.Context(), headerUser)
		if errors.Is(resErr, errs.ErrStaffUserIDNeedsDBMigration) {
			return errs.BadRequest("database cannot map Clerk user ids yet; run supabase migrations or `supabase db reset`, then re-seed")
		}
		if errors.Is(resErr, errs.ErrNotFoundInDB) {
			return errs.BadRequest("user is not registered; complete sign-in or run the Clerk user webhook once")
		}
		if resErr != nil {
			slog.Error("resolve staff user for tasks", "error", resErr)
			return errs.InternalServerError()
		}
		userID = resolved
	}

	cursorStr := strings.TrimSpace(c.Query("cursor"))
	var taskCursor *models.TaskCursor
	if cursorStr != "" {
		decoded, decErr := utils.DecodeTaskCursor(cursorStr)
		if decErr != nil || decoded == nil {
			return errs.BadRequest("invalid cursor")
		}
		if decoded.Tab != tab {
			return errs.BadRequest("cursor does not match tab")
		}
		taskCursor = decoded
	}

	tasks, err := h.repo.FindTasks(c.Context(), hotelID, userID, filter, taskCursor)
	if err != nil {
		return errs.InternalServerError()
	}

	limit := utils.ResolveLimit(filter.Limit)
	page := utils.BuildCursorPage(tasks, limit, func(t *models.Task) string {
		return t.Cursor
	})

	return c.JSON(page)
}

// CreateTask creates a lightweight request row used as a staff task.
func (h *TasksHandler) CreateTask(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}

	var body models.CreateTaskBody
	if err := c.BodyParser(&body); err != nil {
		return errs.InvalidJSON()
	}
	name := strings.TrimSpace(body.Name)
	if name == "" {
		return errs.BadRequest("name must not be empty")
	}

	var userID *string
	if body.AssignToMe {
		header := strings.TrimSpace(c.Get(devUserIDHeader))
		if header == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"message": "sign in required to assign a task to yourself",
			})
		}
		resolved, resErr := h.users.ResolveStaffUserIDForRequests(c.Context(), header)
		if errors.Is(resErr, errs.ErrStaffUserIDNeedsDBMigration) {
			return errs.BadRequest("database cannot map Clerk user ids yet; run supabase migrations or `supabase db reset`, then re-seed")
		}
		if errors.Is(resErr, errs.ErrNotFoundInDB) {
			return errs.BadRequest("user is not registered; complete sign-in or run the Clerk user webhook once")
		}
		if resErr != nil {
			slog.Error("resolve staff user for create task", "error", resErr)
			return errs.InternalServerError()
		}
		userID = &resolved
	}

	status := string(models.StatusPending)
	if body.AssignToMe {
		status = string(models.StatusAssigned)
	}

	req := models.Request{
		MakeRequest: models.MakeRequest{
			HotelID:     hotelID,
			Name:        name,
			RequestType: "adhoc",
			Status:      status,
			Priority:    "medium",
			UserID:      userID,
		},
	}

	if err := validateCreateRequest(&req); err != nil {
		return err
	}

	res, err := h.repo.InsertRequest(c.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, errs.ErrRequestUnknownHotel):
			return errs.BadRequest("hotel not found for X-Hotel-ID; seed hotels or fix the header value")
		case errors.Is(err, errs.ErrRequestUnknownAssignee):
			return errs.BadRequest("assignee is not linked in the database")
		case errors.Is(err, errs.ErrRequestInvalidUserID):
			return errs.BadRequest("user id does not match the database type; run pending migrations (users/requests user_id)")
		default:
			slog.Error("InsertRequest from tasks", "error", err)
			return errs.InternalServerError()
		}
	}

	return c.JSON(fiber.Map{"id": res.ID})
}

// PatchTask updates task (request) status for the hotel.
func (h *TasksHandler) PatchTask(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}
	id := strings.TrimSpace(c.Params("id"))
	if !validUUID(id) {
		return errs.BadRequest("invalid task id")
	}
	var body models.PatchTaskBody
	if err := c.BodyParser(&body); err != nil {
		return errs.InvalidJSON()
	}
	st := strings.TrimSpace(body.Status)
	if !models.RequestStatus(st).IsValid() {
		return errs.BadRequest("invalid status")
	}
	if err := h.repo.UpdateTaskStatus(c.Context(), hotelID, id, st); err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("task", "id", id)
		}
		slog.Error("UpdateTaskStatus", "error", err)
		return errs.InternalServerError()
	}
	return c.SendStatus(http.StatusNoContent)
}

// ClaimTask assigns an unassigned pending task to the current staff user.
func (h *TasksHandler) ClaimTask(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}
	id := strings.TrimSpace(c.Params("id"))
	if !validUUID(id) {
		return errs.BadRequest("invalid task id")
	}
	header := strings.TrimSpace(c.Get(devUserIDHeader))
	if header == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "sign in required to claim a task",
		})
	}
	resolved, resErr := h.users.ResolveStaffUserIDForRequests(c.Context(), header)
	if errors.Is(resErr, errs.ErrStaffUserIDNeedsDBMigration) {
		return errs.BadRequest("database cannot map Clerk user ids yet; run supabase migrations or `supabase db reset`, then re-seed")
	}
	if errors.Is(resErr, errs.ErrNotFoundInDB) {
		return errs.BadRequest("user is not registered; complete sign-in or run the Clerk user webhook once")
	}
	if resErr != nil {
		slog.Error("resolve staff user for claim task", "error", resErr)
		return errs.InternalServerError()
	}
	if err := h.repo.ClaimTask(c.Context(), hotelID, id, resolved); err != nil {
		switch {
		case errors.Is(err, errs.ErrNotFoundInDB):
			return errs.NotFound("task", "id", id)
		case errors.Is(err, errs.ErrTaskStateConflict):
			return errs.NewHTTPError(http.StatusConflict, errors.New("task cannot be claimed in its current state"))
		default:
			slog.Error("ClaimTask", "error", err)
			return errs.InternalServerError()
		}
	}
	return c.SendStatus(http.StatusNoContent)
}

// DropTask returns a task to the unassigned pool if the current user holds it.
func (h *TasksHandler) DropTask(c *fiber.Ctx) error {
	hotelID, err := hotelIDFromHeader(c)
	if err != nil {
		return err
	}
	id := strings.TrimSpace(c.Params("id"))
	if !validUUID(id) {
		return errs.BadRequest("invalid task id")
	}
	header := strings.TrimSpace(c.Get(devUserIDHeader))
	if header == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "sign in required to drop a task",
		})
	}
	resolved, resErr := h.users.ResolveStaffUserIDForRequests(c.Context(), header)
	if errors.Is(resErr, errs.ErrStaffUserIDNeedsDBMigration) {
		return errs.BadRequest("database cannot map Clerk user ids yet; run supabase migrations or `supabase db reset`, then re-seed")
	}
	if errors.Is(resErr, errs.ErrNotFoundInDB) {
		return errs.BadRequest("user is not registered; complete sign-in or run the Clerk user webhook once")
	}
	if resErr != nil {
		slog.Error("resolve staff user for drop task", "error", resErr)
		return errs.InternalServerError()
	}
	if err := h.repo.DropTask(c.Context(), hotelID, id, resolved); err != nil {
		switch {
		case errors.Is(err, errs.ErrNotFoundInDB):
			return errs.NotFound("task", "id", id)
		case errors.Is(err, errs.ErrTaskStateConflict):
			return errs.NewHTTPError(http.StatusConflict, errors.New("task cannot be dropped in its current state"))
		default:
			slog.Error("DropTask", "error", err)
			return errs.InternalServerError()
		}
	}
	return c.SendStatus(http.StatusNoContent)
}
