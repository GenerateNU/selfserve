package handler

import (
	"github.com/generate/selfserve/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type DevsHandler struct {
	repo *repository.DevsRepository
}

func NewDevsHandler(repo *repository.DevsRepository) *DevsHandler {
	return &DevsHandler{repo: repo}
}

func (h *DevsHandler) GetAll(c *fiber.Ctx) error {
	devs, err := h.repo.GetAll(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch devs" + err.Error(),
		})
	}
	return c.JSON(devs)
}
