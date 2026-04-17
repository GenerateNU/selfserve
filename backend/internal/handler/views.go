package handler

import (
	"context"
	"errors"
	"log/slog"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type ViewsRepository interface {
	ListByUserAndSlug(ctx context.Context, userID, slug string) ([]*models.View, error)
	Create(ctx context.Context, userID string, input models.CreateViewInput) (*models.View, error)
	Delete(ctx context.Context, id, userID string) error
}

type ViewsHandler struct {
	repo ViewsRepository
}

func NewViewsHandler(repo ViewsRepository) *ViewsHandler {
	return &ViewsHandler{repo: repo}
}

// ListViews godoc
// @Summary      List views
// @Description  Returns all saved filter views for the authenticated user scoped to a page slug
// @Tags         views
// @Produce      json
// @Param        slug  query     string  true  "Page slug (e.g. requests_web)"
// @Success      200   {array}   models.View
// @Failure      400   {object}  errs.HTTPError
// @Failure      500   {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /views [get]
func (h *ViewsHandler) ListViews(c *fiber.Ctx) error {
	slug := c.Query("slug")
	if slug == "" {
		return errs.BadRequest("slug is required")
	}

	userID := c.Locals("userId").(string)

	views, err := h.repo.ListByUserAndSlug(c.Context(), userID, slug)
	if err != nil {
		slog.Error("failed to list views", "err", err)
		return errs.InternalServerError()
	}

	if views == nil {
		views = []*models.View{}
	}

	return c.JSON(views)
}

// CreateView godoc
// @Summary      Create view
// @Description  Saves the current filter state as a named view for the authenticated user
// @Tags         views
// @Accept       json
// @Produce      json
// @Param        request  body      models.CreateViewInput  true  "View payload"
// @Success      201      {object}  models.View
// @Failure      400      {object}  errs.HTTPError
// @Failure      500      {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /views [post]
func (h *ViewsHandler) CreateView(c *fiber.Ctx) error {
	var input models.CreateViewInput
	if err := httpx.BindAndValidate(c, &input); err != nil {
		return err
	}

	userID := c.Locals("userId").(string)

	view, err := h.repo.Create(c.Context(), userID, input)
	if err != nil {
		slog.Error("failed to create view", "err", err)
		return errs.InternalServerError()
	}

	return c.Status(fiber.StatusCreated).JSON(view)
}

// DeleteView godoc
// @Summary      Delete view
// @Description  Deletes a saved filter view owned by the authenticated user
// @Tags         views
// @Param        id  path  string  true  "View ID"
// @Success      204
// @Failure      404  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /views/{id} [delete]
func (h *ViewsHandler) DeleteView(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}

	userID := c.Locals("userId").(string)

	if err := h.repo.Delete(c.Context(), id, userID); err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("view", "id", id)
		}
		slog.Error("failed to delete view", "err", err)
		return errs.InternalServerError()
	}

	return c.SendStatus(fiber.StatusNoContent)
}
