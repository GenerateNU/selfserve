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

func (h *DevsHandler) GetMember(c *fiber.Ctx) error {
	name := c.Params("name")
	if name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "name is required",
		})
	}
	devs, err := h.repo.GetMember(c.Context(), name)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch dev: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(devs)
}
