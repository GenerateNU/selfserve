package handler

import (
	"os"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	svix "github.com/svix/svix-webhooks/go"
)


type ClerkHandler struct {
	UsersRepository storage.UsersRepository
	Webhook *svix.Webhook
}


func NewClerkHandler(userRepo storage.UsersRepository) (*ClerkHandler, error) {
	wh, err := svix.NewWebhook(os.Getenv("DEV_CLERK_WEBHOOK_SIGNATURE"))
	if err != nil {
		return nil, err
	}
	return &ClerkHandler{UsersRepository: userRepo, Webhook : wh}, nil
}

func (h *ClerkHandler) CreateUser(c *fiber.Ctx) error {
	headers := map[string][]string{
		"svix-id":        {c.Get("svix-id")},
		"svix-timestamp": {c.Get("svix-timestamp")},
		"svix-signature": {c.Get("svix-signature")},
	}

	err := h.Webhook.Verify(c.Body(), headers)
	if err != nil {
		errs.Unauthorized()
	}

	var CreateUserRequest models.CreateUserWebhook
	if err := c.BodyParser(&CreateUserRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := validateCreateUserClerk(&CreateUserRequest); err != nil {
		return err
	}

	res, err := h.UsersRepository.InsertUser(c.Context(), reformatUserData(CreateUserRequest))
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

func validateCreateUserClerk(user *models.CreateUserWebhook) error {
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

	return AggregateErrors(errors)
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
