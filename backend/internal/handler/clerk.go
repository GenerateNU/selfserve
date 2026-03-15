package handler

import (
	"errors"
	"net/http"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	svix "github.com/svix/svix-webhooks/go"
)

type ClerkWebHookHandler struct {
	UsersRepository  storage.UsersRepository
	HotelsRepository storage.HotelsRepository
	WebhookVerifier  WebhookVerifier
}

type WebhookVerifier interface {
	Verify(payload []byte, headers http.Header) error
}

func NewWebhookVerifier(cfg *config.Config) (WebhookVerifier, error) {
	return svix.NewWebhook(cfg.Clerk.WebhookSignature)
}

func NewClerkWebHookHandler(userRepo storage.UsersRepository, hotelsRepo storage.HotelsRepository, webhookVerifier WebhookVerifier) *ClerkWebHookHandler {
	return &ClerkWebHookHandler{
		UsersRepository:  userRepo,
		HotelsRepository: hotelsRepo,
		WebhookVerifier:  webhookVerifier,
	}
}

func (h *ClerkWebHookHandler) verifySvix(c *fiber.Ctx) error {
	headers := http.Header{}
	headers.Set("svix-id", c.Get("svix-id"))
	headers.Set("svix-timestamp", c.Get("svix-timestamp"))
	headers.Set("svix-signature", c.Get("svix-signature"))
	if err := h.WebhookVerifier.Verify(c.Body(), headers); err != nil {
		return errs.Unauthorized()
	}
	return nil
}

// OrgMembershipCreated handles Clerk's organizationMembership.created webhook.
// This is the canonical user creation point for hotel staff — the org ID in the
// payload maps to a hotel, so we can create the user with hotel_id in one step.
func (h *ClerkWebHookHandler) CreateOrgMembership(c *fiber.Ctx) error {
	if err := h.verifySvix(c); err != nil {
		return err
	}

	var payload models.CreateUserOrgMembershipWebhook
	if err := c.BodyParser(&payload); err != nil {
		return errs.InvalidJSON()
	}

	hotel, err := h.HotelsRepository.FindByClerkOrgID(c.Context(), payload.Data.Organization.ID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.BadRequest("organization is not associated with a hotel")
		}
		return errs.InternalServerError()
	}

	userData := &payload.Data.PublicUserData
	user, err := h.UsersRepository.InsertUser(c.Context(), ReformatOrgMembershipUserData(userData, hotel.ID))
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(user)
}
