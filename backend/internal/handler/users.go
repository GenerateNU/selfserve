package handler

import (
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)

type UsersHandler struct {
	UsersRepository storage.UsersRepository
}

func NewUsersHandler(repo storage.UsersRepository) *UsersHandler {
	return &UsersHandler{UsersRepository: repo}
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
	var incoming models.CreateUser
	if err := c.BodyParser(&incoming); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateCreateUser(&incoming); err != nil {
		return err
	}

	res, err := h.UsersRepository.InsertUser(c.Context(), &incoming)
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

	if strings.TrimSpace(user.Role) == "" {
		errors["role"] = "must not be an empty string"
	}

	if user.Timezone != nil {
		if _, err := time.LoadLocation(*user.Timezone); err != nil {
			errors["timezone"] = "invalid IANA timezone"
		}
	}

	if len(errors) > 0 {
		var parts []string
		for field, violation := range errors {
			parts = append(parts, field+": "+violation)
		}
		return errs.BadRequest(strings.Join(parts, ", "))
	}
	return nil
}
