package handler

import (
	"errors"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/generate/selfserve/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

type TasksHandler struct {
	repo  storage.RequestsRepository
	users authUserLookup
}

func NewTasksHandler(repo storage.RequestsRepository, users authUserLookup) *TasksHandler {
	return &TasksHandler{repo: repo, users: users}
}

// GetTasks godoc
// @Summary      List staff tasks
// @Description  Cursor-paginated tasks for my work or the unassigned pool
// @Tags         tasks
// @Produce      json
// @Param        tab         query     string  true   "my or unassigned"
// @Param        limit       query     int     false  "Page size (default 20)"
// @Param        cursor      query     string  false  "Opaque cursor"
// @Param        status      query     string  false  "Filter by status"
// @Param        department  query     string  false  "Filter by department (case-insensitive)"
// @Param        priority    query     string  false  "Filter by priority"
// @Success      200         {object}  utils.CursorPage[models.Task]
// @Failure      400         {object}  errs.HTTPError
// @Failure      401         {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /tasks [get]
func (h *TasksHandler) GetTasks(c *fiber.Ctx) error {
	clerkID, hotelID, err := userIDAndHotelFromAuth(c, h.users)
	if err != nil {
		return err
	}

	var q models.TaskFilter
	if err := c.QueryParser(&q); err != nil {
		return errs.BadRequest("invalid query parameters")
	}
	if err := httpx.Validate(&q); err != nil {
		return err
	}
	if !q.Tab.IsValid() {
		return errs.BadRequest("tab must be my or unassigned")
	}

	hasCursor := strings.TrimSpace(q.Cursor) != ""
	var (
		cPR int
		cDK string
		cCA time.Time
		cID string
	)
	if hasCursor {
		cPR, cDK, cCA, cID, err = utils.DecodeTaskCursor(q.Cursor, q.Tab)
		if err != nil {
			return errs.BadRequest(err.Error())
		}
	}

	items, err := h.repo.FindTasks(c.Context(), hotelID, clerkID, q, cPR, cDK, cCA, cID, hasCursor)
	if err != nil {
		return errs.InternalServerError()
	}

	page := utils.BuildCursorPage(items, utils.ResolveLimit(q.Limit), func(t models.Task) string { return t.Cursor })
	return c.JSON(page)
}

// CreateTask godoc
// @Summary      Create adhoc staff task
// @Description  Creates a lightweight adhoc request for the authenticated user's hotel
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Param        body  body  models.CreateTaskBody  true  "Task"
// @Success      200   {object}  models.Request
// @Failure      400   {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /tasks [post]
func (h *TasksHandler) CreateTask(c *fiber.Ctx) error {
	clerkID, hotelID, err := userIDAndHotelFromAuth(c, h.users)
	if err != nil {
		return err
	}

	var body models.CreateTaskBody
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return err
	}

	priority := strings.TrimSpace(body.Priority)
	if priority == "" {
		priority = string(models.PriorityMedium)
	}

	status := string(models.StatusPending)
	var userID *string
	if body.AssignToMe {
		u := clerkID
		userID = &u
		status = string(models.StatusAssigned)
	}

	desc := strings.TrimSpace(body.Description)
	var descPtr *string
	if desc != "" {
		descPtr = &desc
	}

	dept := strings.TrimSpace(body.Department)
	var deptPtr *string
	if dept != "" {
		deptPtr = &dept
	}

	emptyNotes := ""
	req := &models.Request{
		ID: uuid.New().String(),
		MakeRequest: models.MakeRequest{
			HotelID:     hotelID,
			Name:        strings.TrimSpace(body.Name),
			Description: descPtr,
			RequestType: "adhoc",
			Status:      status,
			Priority:    priority,
			Department:  deptPtr,
			UserID:      userID,
			Notes:       &emptyNotes,
		},
	}

	res, err := h.repo.InsertRequest(c.Context(), req)
	if err != nil {
		var pe *pgconn.PgError
		if errors.As(err, &pe) && pe.Code == "23503" {
			return errs.BadRequest("invalid hotel or user reference")
		}
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

// PatchTask godoc
// @Summary      Update task status
// @Tags         tasks
// @Accept       json
// @Produce      json
// @Param        id    path   string               true  "Request id"
// @Param        body  body   models.PatchTaskBody true  "Patch"
// @Success      200   {object}  models.Request
// @Failure      400   {object}  errs.HTTPError
// @Failure      404   {object}  errs.HTTPError
// @Failure      409   {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /tasks/{id} [patch]
func (h *TasksHandler) PatchTask(c *fiber.Ctx) error {
	clerkID, hotelID, err := userIDAndHotelFromAuth(c, h.users)
	if err != nil {
		return err
	}

	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return errs.BadRequest("task id is not a valid UUID")
	}

	var body models.PatchTaskBody
	if err := httpx.BindAndValidate(c, &body); err != nil {
		return err
	}

	err = h.repo.UpdateTaskStatus(c.Context(), hotelID, id, clerkID, body.Status)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("task", "id", id)
		}
		if errors.Is(err, errs.ErrTaskStateConflict) {
			return errs.TaskStateHTTPConflict()
		}
		return errs.InternalServerError()
	}

	updated, err := h.repo.FindRequest(c.Context(), id)
	if err != nil {
		return errs.InternalServerError()
	}
	return c.JSON(updated)
}

// ClaimTask godoc
// @Summary      Claim unassigned task
// @Tags         tasks
// @Produce      json
// @Param        id  path  string  true  "Request id"
// @Success      200  {object}  models.Request
// @Failure      404  {object}  errs.HTTPError
// @Failure      409  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /tasks/{id}/claim [post]
func (h *TasksHandler) ClaimTask(c *fiber.Ctx) error {
	clerkID, hotelID, err := userIDAndHotelFromAuth(c, h.users)
	if err != nil {
		return err
	}

	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return errs.BadRequest("task id is not a valid UUID")
	}

	err = h.repo.ClaimTask(c.Context(), hotelID, id, clerkID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("task", "id", id)
		}
		if errors.Is(err, errs.ErrTaskStateConflict) {
			return errs.TaskStateHTTPConflict()
		}
		return errs.InternalServerError()
	}

	updated, err := h.repo.FindRequest(c.Context(), id)
	if err != nil {
		return errs.InternalServerError()
	}
	return c.JSON(updated)
}

// DropTask godoc
// @Summary      Drop claimed task back to pool
// @Tags         tasks
// @Produce      json
// @Param        id  path  string  true  "Request id"
// @Success      200  {object}  models.Request
// @Failure      404  {object}  errs.HTTPError
// @Failure      409  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /tasks/{id}/drop [post]
func (h *TasksHandler) DropTask(c *fiber.Ctx) error {
	clerkID, hotelID, err := userIDAndHotelFromAuth(c, h.users)
	if err != nil {
		return err
	}

	id := c.Params("id")
	if _, err := uuid.Parse(id); err != nil {
		return errs.BadRequest("task id is not a valid UUID")
	}

	err = h.repo.DropTask(c.Context(), hotelID, id, clerkID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("task", "id", id)
		}
		if errors.Is(err, errs.ErrTaskStateConflict) {
			return errs.TaskStateHTTPConflict()
		}
		return errs.InternalServerError()
	}

	updated, err := h.repo.FindRequest(c.Context(), id)
	if err != nil {
		return errs.InternalServerError()
	}
	return c.JSON(updated)
}
