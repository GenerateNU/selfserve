package handler

import (
	"context"
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type UsersRepository interface {
	FindUser(ctx context.Context, id string) (*models.User, error)
	InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error)
}

type UsersHandler struct {
	repo UsersRepository
}

func NewUsersHandler(repo UsersRepository) *UsersHandler {
	return &UsersHandler{repo: repo}
}

// GetUserByID godoc
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
	user, err := h.repo.FindUser(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("user", "id", id)
		}
		slog.Error(err.Error())
		return errs.InternalServerError()
	}
	return c.JSON(user)
}

// CreateUser godoc
// @Summary      Creates a user
// @Description  Creates a user with the given data
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        request  body   models.CreateUser  true  "User data"
// @Success      200   {object}  models.User
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /users [post]
func (h *UsersHandler) CreateUser(c *fiber.Ctx) error {
	var CreateUserRequest models.CreateUser
	if err := c.BodyParser(&CreateUserRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateCreateUser(&CreateUserRequest); err != nil {
		return err
	}

	res, err := h.repo.InsertUser(c.Context(), &CreateUserRequest)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

func validateCreateUser(user *models.CreateUser) error {
	errors := make(map[string]string)

	if strings.TrimSpace(user.FirstName) == "" {
		errors["first_name"] = "must not be an empty string"
	}

	if strings.TrimSpace(user.LastName) == "" {
		errors["last_name"] = "must not be an empty string"
	}

	if user.Timezone != nil {
		_, err := time.LoadLocation(*user.Timezone)
		if err != nil || !strings.Contains(*user.Timezone, "/") {
			errors["timezone"] = "invalid IANA timezone"
		}
	}

	if strings.TrimSpace(user.ID) == "" {
		errors["id"] = "must not be an empty string"
	}

	// Aggregates errors deterministically
	return AggregateErrors(errors)
}
