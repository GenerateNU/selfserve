package handler

import (
	"context"

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
		return err
	}

	return c.JSON(dev)
}
