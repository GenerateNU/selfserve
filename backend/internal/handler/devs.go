package handler

import (
	_ "github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type DevsHandler struct {
	repo *repository.DevsRepository
}

func NewDevsHandler(repo *repository.DevsRepository) *DevsHandler {
	return &DevsHandler{repo: repo}
}

// GetMember godoc
// @Summary      Get developer member
// @Description  Retrieves a developer member by name
// @Tags         devs
// @Accept       json
// @Produce      json
// @Param        name  path      string  true  "Developer name"
// @Success      200   {object}  models.Dev
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /devs/{name} [get]
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
