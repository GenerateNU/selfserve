package handler

import (
	"context"
	"errors"

	"log/slog"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type UsersRepository interface {

	GetUserById(ctx context.Context, id string) (*models.User, error)
}

type UsersHandler struct {

	repo UsersRepository

}

func NewUserHandler(repo UsersRepository) *UsersHandler {
	return &UsersHandler{repo: repo}
}

// GetUserById godoc
// @Summary      Get user by ID
// @Description  Retrieves a user by their unique app ID
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id  path      string  true  "User ID"
// @Success      200   {object}  models.User
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /users/{id} [get]

func (h *UsersHandler) GetUserByID(c *fiber.Ctx) error {

	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}
	user, err := h.repo.GetUserById(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("user", "id", id)
		}
		slog.Error(err.Error())
		return errs.InternalServerError()

	}
	return c.JSON(user)
}