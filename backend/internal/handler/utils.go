package handler

import (
	"sort"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const hotelIDHeader = "X-Hotel-ID"
const roleAdmin = "admin"

func validUUID(s string) bool {
	_, err := uuid.Parse(s)
	return err == nil
}

func hotelIDFromHeader(c *fiber.Ctx) (string, error) {
	hotelID := strings.TrimSpace(c.Get(hotelIDHeader))
	if hotelID == "" {
		return "", errs.BadRequest("hotel_id header is required")
	}
	if !strings.HasPrefix(hotelID, "org_") {
		return "", errs.BadRequest("hotel_id header is invalid")
	}
	return hotelID, nil
}

func AdminMiddleware(usersRepo storage.UsersRepository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userId").(string)
		if !ok || userID == "" {
			return errs.Unauthorized()
		}
		user, err := usersRepo.FindUser(c.Context(), userID)
		if err != nil {
			return errs.Forbidden()
		}
		if user.Role == nil || *user.Role != roleAdmin {
			return errs.Forbidden()
		}
		return c.Next()
	}
}

func AggregateErrors(errors map[string]string) error {
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

func ValidateCreateUserClerk(user *models.ClerkUser) error {
	errors := make(map[string]string)

	if strings.TrimSpace(user.ID) == "" {
		errors["id"] = "must not be an empty string"
	}

	if strings.TrimSpace(user.FirstName) == "" {
		errors["first_name"] = "must not be an empty string"
	}

	if strings.TrimSpace(user.LastName) == "" {
		errors["last_name"] = "must not be an empty string"
	}

	return AggregateErrors(errors)
}

func ReformatUserData(CreateUserRequest *models.ClerkUser) *models.CreateUser {
	result := &models.CreateUser{
		FirstName: CreateUserRequest.FirstName,
		LastName:  CreateUserRequest.LastName,
		ID:        CreateUserRequest.ID,
	}
	if CreateUserRequest.HasImage {
		result.ProfilePicture = CreateUserRequest.ImageUrl
	}
	return result
}

func ReformatOrgMembershipUserData(userData *models.OrgMembershipUserData, hotelID string) *models.CreateUser {
	result := &models.CreateUser{
		ID:        userData.UserID,
		FirstName: userData.FirstName,
		LastName:  userData.LastName,
		HotelID:   hotelID,
	}
	if userData.HasImage {
		result.ProfilePicture = userData.ImageUrl
	}
	return result
}
