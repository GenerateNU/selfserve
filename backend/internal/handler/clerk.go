package handler

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/generate/selfserve/internal/utils"
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
			return c.SendStatus(fiber.StatusServiceUnavailable)
		}
		return errs.InternalServerError()
	}

	userData := &payload.Data.PublicUserData
	_, err = h.UsersRepository.InsertUser(c.Context(), ReformatOrgMembershipUserData(userData, hotel.ID))
	if err != nil {
		return errs.InternalServerError()
	}

	return c.SendStatus(fiber.StatusOK)
}

// When a new org is created in Clerk, we create a corresponding hotel in our DB
func (h *ClerkWebHookHandler) OrgCreated(c *fiber.Ctx) error {
	if err := h.verifySvix(c); err != nil {
		return err
	}

	var payload models.CreateOrgWebhook
	if err := c.BodyParser(&payload); err != nil {
		return errs.InvalidJSON()
	}

	hotel, err := h.HotelsRepository.InsertHotelFromClerkOrg(c.Context(), payload.Data.ID, payload.Data.Name)
	if err != nil {
		if errors.Is(err, errs.ErrAlreadyExistsInDB) {
			return c.SendStatus(fiber.StatusOK)
		}
		return errs.InternalServerError()
	}

	if err := utils.UpdateOrgMetadata(c.Context(), payload.Data.ID, hotel.ID); err != nil {
		slog.Error("failed to update org metadata", "clerk_org_id", payload.Data.ID, "error", err)
	}

	return c.SendStatus(fiber.StatusOK)
}
