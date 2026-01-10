package handler

import (
	"errors"
	"log/slog"

	"github.com/generate/selfserve/internal/errs"
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
		return errs.BadRequest("name is required")
	}
	devs, err := h.repo.GetMember(c.Context(), name)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("member", "name", name)
		}
		slog.Error(err.Error())
		return errs.InternalServerError()
	}
	return c.Status(fiber.StatusOK).JSON(devs)
}

func (h *DevsHandler) GetDevs(c *fiber.Ctx) error {
	devs, err := h.repo.GetDevs(c.Context())
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
            return errs.NotFound("devs", "rows", "")
        }
		slog.Error(err.Error())
		return errs.InternalServerError()
	}
	return c.Status(fiber.StatusOK).JSON(devs)	
}

func (h *DevsHandler) MakeDev(c *fiber.Ctx) error {
	name := c.Params("name")
	if name == "" {
		return errs.BadRequest("name is required")
	}

	
}
