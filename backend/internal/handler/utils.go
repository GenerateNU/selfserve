package handler

import (
	"sort"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/google/uuid"
)

func validUUID(s string) bool {
	_, err := uuid.Parse(s)
	return err == nil
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
		ClerkID:   CreateUserRequest.ID,
	}
	if CreateUserRequest.HasImage {
		result.ProfilePicture = CreateUserRequest.ImageUrl
	}
	return result
}
