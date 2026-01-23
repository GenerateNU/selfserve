package handler

import (
	"sort"
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
	var CreateUserRequest models.CreateUser
	if err := c.BodyParser(&CreateUserRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateCreateUser(&CreateUserRequest); err != nil {
		return err
	}

	res, err := h.UsersRepository.InsertUser(c.Context(), &CreateUserRequest)
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

	// Aggregates errors deterministically
	if len(errors) > 0 {
		var keys []string
		for k := range errors {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		var parts []string
		for _, k := range keys {
			parts = append(parts, k+": "+errors[k])
		}
		return errs.BadRequest(strings.Join(parts, ", "))
	}

	return nil
}
