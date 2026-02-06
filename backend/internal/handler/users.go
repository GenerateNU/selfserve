package handler

import (
	"context"
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

// UpdateProfilePictureRequest represents the request body for updating a profile picture
// @Description Request body containing the S3 key after uploading
type UpdateProfilePictureRequest struct {
	Key string `json:"key" example:"profile-pictures/user123/1706540000.jpg"`
}

type UsersHandler struct {
	UsersRepository storage.UsersRepository
	S3Storage       storage.S3Storage
}

func NewUsersHandler(repo storage.UsersRepository, s3 storage.S3Storage) *UsersHandler {
	return &UsersHandler{UsersRepository: repo, S3Storage: s3}
}

// GetUserByID godoc
// @Summary      Get user by ID
// @Description  Retrieves a user by their unique app ID
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id  path      string  true  "User ID"
// @Success      200   {object}  models.User
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /users/{id} [get]
func (h *UsersHandler) GetUserByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}
	user, err := h.UsersRepository.FindUser(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("user", "id", id)
		}
		slog.Error(err.Error())
		return errs.InternalServerError()
	}
	return c.JSON(user)
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

	res, err := h.repo.InsertUser(c.Context(), &CreateUserRequest)
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

	if user.Timezone != nil {
		_, err := time.LoadLocation(*user.Timezone)
		if err != nil || !strings.Contains(*user.Timezone, "/") {
			errors["timezone"] = "invalid IANA timezone"
		}
	}

	if strings.TrimSpace(user.ClerkID) == "" {
		errors["clerk_id"] = "must not be an empty string"
	}

	// Aggregates errors deterministically
	return AggregateErrors(errors)
}

// GetProfilePicture godoc
// @Summary      Get user's profile picture
// @Description  Retrieves the user's profile picture key and returns a presigned URL for display
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        userId   path      string                        true  "User ID"
// @Success      200      {object}  map[string]string  "Returns key and presigned_url if profile picture exists"
// @Failure      400      {object}  map[string]string
// @Failure      404      {object}  map[string]string  "No profile picture found"
// @Failure      500      {object}  map[string]string
// @Router       /users/{userId}/profile-picture [get]
func (h *UsersHandler) GetProfilePicture(c *fiber.Ctx) error {
	userId := c.Params("userId")
	if userId == "" {
		return errs.BadRequest("userId is required")
	}

	key, err := h.UsersRepository.GetKey(c.Context(), userId)
	if err != nil {
		return errs.InternalServerError()
	}

	if key == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "No profile picture found",
		})
	}

	// Generate presigned URL for displaying the image
	presignedURL, err := h.S3Storage.GeneratePresignedGetURL(c.Context(), key, 5*time.Minute)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"key":           key,
		"presigned_url": presignedURL,
	})
}

// UpdateProfilePicture godoc
// @Summary      Update user's profile picture
// @Description  Saves the S3 key to the user's profile after the image has been uploaded to S3
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        userId   path      string                        true  "User ID"
// @Param        request  body      UpdateProfilePictureRequest   true  "S3 key from upload"
// @Success      200      {object}  map[string]string
// @Failure      400      {object}  map[string]string
// @Failure      500      {object}  map[string]string
// @Router       /users/{userId}/profile-picture [put]
func (h *UsersHandler) UpdateProfilePicture(c *fiber.Ctx) error {
	userId := c.Params("userId")
	if userId == "" {
		return errs.BadRequest("userId is required")
	}
	var req UpdateProfilePictureRequest
	if err := c.BodyParser(&req); err != nil {
		return errs.InvalidJSON()
	}
	if req.Key == "" {
		return errs.BadRequest("key is required")
	}
	if err := h.UsersRepository.UpdateProfilePicture(c.Context(), userId, req.Key); err != nil {
		return errs.InternalServerError()
	}
	return c.JSON(fiber.Map{
		"message": "Profile picture updated successfully",
	})
}

// DeleteProfilePicture godoc
// @Summary      Delete user's profile picture
// @Description  Deletes the user's profile picture from the database
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        userId   path      string                        true  "User ID"
// @Success      200      {object}  map[string]string
// @Failure      400      {object}  map[string]string
// @Failure      500      {object}  map[string]string
// @Router       /users/{userId}/profile-picture [delete]
func (h *UsersHandler) DeleteProfilePicture(c *fiber.Ctx) error {
	userId := c.Params("userId")
	if userId == "" {
		return errs.BadRequest("userId is required")
	}
	key, err := h.UsersRepository.GetKey(c.Context(), userId)
	if err != nil {
		return errs.InternalServerError()
	}

	if key != "" {
		if err := h.S3Storage.DeleteFile(c.Context(), key); err != nil {
			return errs.InternalServerError()
		}
	}

	if err := h.UsersRepository.DeleteProfilePicture(c.Context(), userId); err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"message": "Profile picture deleted successfully",
	})
}