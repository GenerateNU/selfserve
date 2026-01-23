package handler

import (
	"strings"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)


type ClerkHandler struct {
	UsersRepository storage.UsersRepository
}


func newClerkHandler(userRepo storage.UsersRepository) *ClerkHandler {
	return &ClerkHandler{UsersRepository: userRepo}
}


func (h *ClerkHandler) CreateUser(c *fiber.Ctx) error {
	var CreateUserRequest models.CreateUserWebhook
	if err := c.BodyParser(&CreateUserRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateCreateUser(&CreateUserRequest); err != nil {
		return err
	}

	res, err := h.UsersRepository.InsertUser(c.Context(), reformatUserData(CreateUserRequest))
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

func validateCreateUser(user *models.CreateUserWebhook) error {
	errors := make(map[string]string)

	if strings.TrimSpace(user.Data.ID) == "" {
		errors["id"] = "must not be an empty string"
	}

	if strings.TrimSpace(user.Data.FirstName) == "" {
		errors["first_name"] = "must not be an empty string"
	}

	if strings.TrimSpace(user.Data.LastName) == "" {
		errors["last_name"] = "must not be an empty string"
	}

	return handler.AggregateErrors(errors)
}

func reformatUserData(CreateUserRequest models.CreateUserWebhook) *models.CreateUser {
	result := &models.CreateUser{
		FirstName: CreateUserRequest.Data.FirstName,
		LastName: CreateUserRequest.Data.LastName,
		ClerkID: CreateUserRequest.Data.ID,
	}
	if (CreateUserRequest.Data.HasImage) {
		result.ProfilePicture = CreateUserRequest.Data.ImageUrl
	}
	return result 
}
