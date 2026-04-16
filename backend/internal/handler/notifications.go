package handler

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type NotificationsRepository interface {
	FindByUserID(ctx context.Context, userID string, before *time.Time) ([]*models.Notification, error)
	MarkRead(ctx context.Context, id, userID string) error
	MarkAllRead(ctx context.Context, userID string) error
	UpsertDeviceToken(ctx context.Context, userID, token, platform string) error
}

type NotificationsHandler struct {
	repo NotificationsRepository
}

func NewNotificationsHandler(repo NotificationsRepository) *NotificationsHandler {
	return &NotificationsHandler{repo: repo}
}

// ListNotifications godoc
// @Summary      List notifications
// @Description  Returns the most recent notifications for the authenticated user, paginated by cursor
// @Tags         notifications
// @Produce      json
// @Param        before  query  string  false  "Cursor: return notifications created before this RFC3339 timestamp"
// @Success      200  {array}   models.Notification
// @Failure      400  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /notifications [get]
func (h *NotificationsHandler) ListNotifications(c *fiber.Ctx) error {
	userID := c.Locals("userId").(string)

	var before *time.Time
	if raw := c.Query("before"); raw != "" {
		t, err := time.Parse(time.RFC3339Nano, raw)
		if err != nil {
			return errs.BadRequest("before must be a valid RFC3339 timestamp")
		}
		before = &t
	}

	notifications, err := h.repo.FindByUserID(c.Context(), userID, before)
	if err != nil {
		slog.Error("failed to list notifications", "err", err)
		return errs.InternalServerError()
	}

	if notifications == nil {
		notifications = []*models.Notification{}
	}

	return c.JSON(notifications)
}

// MarkRead godoc
// @Summary      Mark notification as read
// @Description  Marks a single notification as read for the authenticated user
// @Tags         notifications
// @Param        id  path  string  true  "Notification ID"
// @Success      204
// @Failure      404  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /notifications/{id}/read [put]
func (h *NotificationsHandler) MarkRead(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}

	userID := c.Locals("userId").(string)

	if err := h.repo.MarkRead(c.Context(), id, userID); err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("notification", "id", id)
		}
		slog.Error("failed to mark notification as read", "err", err)
		return errs.InternalServerError()
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// MarkAllRead godoc
// @Summary      Mark all notifications as read
// @Description  Marks all unread notifications as read for the authenticated user
// @Tags         notifications
// @Success      204
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /notifications/read-all [put]
func (h *NotificationsHandler) MarkAllRead(c *fiber.Ctx) error {
	userID := c.Locals("userId").(string)

	if err := h.repo.MarkAllRead(c.Context(), userID); err != nil {
		slog.Error("failed to mark all notifications as read", "err", err)
		return errs.InternalServerError()
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// RegisterDeviceToken godoc
// @Summary      Register device token
// @Description  Registers an Expo push token so the user receives mobile push notifications
// @Tags         notifications
// @Accept       json
// @Param        request  body  models.RegisterDeviceTokenInput  true  "Device token"
// @Success      204
// @Failure      400  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /device-tokens [post]
func (h *NotificationsHandler) RegisterDeviceToken(c *fiber.Ctx) error {
	var input models.RegisterDeviceTokenInput
	if err := httpx.BindAndValidate(c, &input); err != nil {
		return err
	}

	userID := c.Locals("userId").(string)

	if err := h.repo.UpsertDeviceToken(c.Context(), userID, input.Token, input.Platform); err != nil {
		slog.Error("failed to register device token", "err", err)
		return errs.InternalServerError()
	}

	return c.SendStatus(fiber.StatusNoContent)
}
