package handler

import (
	"github.com/generate/selfserve/config" 
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	svix "github.com/svix/svix-webhooks/go"
	"net/http"
)

type ClerkWebHookHandler struct {
	UsersRepository storage.UsersRepository
	WebhookVerifier WebhookVerifier
}

type WebhookVerifier interface {
	Verify(payload []byte, headers http.Header) error
}

func NewWebhookVerifier(cfg *config.Config) (WebhookVerifier, error) {
	return svix.NewWebhook(cfg.Clerk.WebhookSignature)
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
	clerkUser := &CreateUserRequest.ClerkUser
	if err := ValidateCreateUserClerk(clerkUser); err != nil {
		return err
	}

	res, err := h.UsersRepository.InsertUser(c.Context(), ReformatUserData(clerkUser))
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}