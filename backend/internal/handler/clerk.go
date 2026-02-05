package handler

import (
	"net/http"
	"os"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	svix "github.com/svix/svix-webhooks/go"
)

type ClerkWebHookHandler struct {
	UsersRepository storage.UsersRepository
	WebhookVerifier WebhookVerifier
}

type WebhookVerifier interface {
	Verify(payload []byte, headers http.Header) error
}

func NewWebhookVerifier() (WebhookVerifier, error) {
	return svix.NewWebhook(os.Getenv("DEV_CLERK_WEBHOOK_SIGNATURE"))
}

func NewClerkWebHookHandler(userRepo storage.UsersRepository, WebhookVerifier WebhookVerifier) *ClerkWebHookHandler {
	return &ClerkWebHookHandler{UsersRepository: userRepo, WebhookVerifier: WebhookVerifier}
}

func (h *ClerkWebHookHandler) CreateUser(c *fiber.Ctx) error {
	headers := http.Header{}
	headers.Set("svix-id", c.Get("svix-id"))
	headers.Set("svix-timestamp", c.Get("svix-timestamp"))
	headers.Set("svix-signature", c.Get("svix-signature"))

	err := h.WebhookVerifier.Verify(c.Body(), headers)
	if err != nil {
		return errs.Unauthorized()
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
		LastName:  CreateUserRequest.Data.LastName,
		ID:   CreateUserRequest.Data.ID,
	}
	if CreateUserRequest.Data.HasImage {
		result.ProfilePicture = CreateUserRequest.Data.ImageUrl
	}
	return result
}
