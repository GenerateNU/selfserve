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
	FindAllByUserAndSlug(ctx context.Context, userID string, slug models.ViewSlug) ([]*models.View, error)
	Insert(ctx context.Context, userID string, input models.CreateViewInput) (*models.View, error)
	Update(ctx context.Context, id, userID string, input models.UpdateViewInput) (*models.View, error)
	Delete(ctx context.Context, id, userID string) error
}

type ViewsHandler struct {
	repo ViewsRepository
}

func NewViewsHandler(repo ViewsRepository) *ViewsHandler {
	return &ViewsHandler{repo: repo}
}

// GetAllViews godoc
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
func (h *ViewsHandler) GetAllViews(c *fiber.Ctx) error {
	slug := c.Query("slug")
	if !models.IsValidViewSlug(slug) {
		return errs.BadRequest("invalid slug")
	}

	userID := c.Locals("userId").(string)

	views, err := h.repo.FindAllByUserAndSlug(c.Context(), userID, models.ViewSlug(slug))
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

	view, err := h.repo.Insert(c.Context(), userID, input)
	if err != nil {
		slog.Error("failed to create view", "err", err)
		return errs.InternalServerError()
	}

	return c.Status(fiber.StatusCreated).JSON(view)
}

// UpdateView godoc
// @Summary      Update view
// @Description  Updates the filters of a saved view owned by the authenticated user
// @Tags         views
// @Accept       json
// @Produce      json
// @Param        id       path      string                   true  "View ID"
// @Param        request  body      models.UpdateViewInput   true  "Update payload"
// @Success      200      {object}  models.View
// @Failure      400      {object}  errs.HTTPError
// @Failure      404      {object}  errs.HTTPError
// @Failure      500      {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /views/{id} [post]
func (h *ViewsHandler) UpdateView(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}

	var input models.UpdateViewInput
	if err := httpx.BindAndValidate(c, &input); err != nil {
		return err
	}

	userID := c.Locals("userId").(string)

	view, err := h.repo.Update(c.Context(), id, userID, input)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("view", "id", id)
		}
		slog.Error("failed to update view", "err", err)
		return errs.InternalServerError()
	}

	return c.JSON(view)
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
