package handler

import (
	"context"
	"errors"
	"log/slog"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type DevsRepository interface {
	GetMember(ctx context.Context, name string) (*models.Dev, error)
}

type DevsHandler struct {
	repo DevsRepository
}

func NewDevsHandler(repo DevsRepository) *DevsHandler {
	return &DevsHandler{repo: repo}
}

func (h *DevsHandler) GetMember(c *fiber.Ctx) error {
	name := c.Params("name")
	if name == "" {
		return errs.BadRequest("name is required")
	}

	dev, err := h.repo.GetMember(c.Context(), name)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("member", "name", name)
		}
		slog.Error(err.Error())
		return errs.InternalServerError()
	}

	return c.JSON(dev)
}

func (h *DevsHandler) GetAllDevs(c *fiber.Ctx) error {
	devs, err := h.repo.GetAllDevs(c.Context())
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(devs)
}

func (h *DevsHandler) CreateDev(c *fiber.Ctx) error {
	var req struct {
		Name string `json:"name"`
	}

	if err := c.BodyParser(&req); err != nil {
		return errs.BadRequest("invalid request body")
	}

	if req.Name == "" {
		return errs.BadRequest("name is required")
	}

	dev, err := h.repo.CreateDev(c.Context(), req.Name)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dev)
}
