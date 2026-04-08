package handler

import (
	"errors"
	"log/slog"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)

// UpdateProfilePictureRequest represents the request body for updating a profile picture
// @Description Request body containing the S3 key after uploading
type UpdateProfilePictureRequest struct {
	Key string `json:"key" validate:"notblank" example:"profile-pictures/user123/1706540000.jpg"`
}

type SearchUsersQuery struct {
	HotelID string `validate:"notblank"`
	Cursor  string
	Query   string
}

const defaultUsersPageSize = 20

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
// @Security     BearerAuth
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

// SearchUsers godoc
// @Summary      Search users by hotel
// @Description  Returns a paginated list of users for a hotel, optionally filtered by name
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        hotel_id  query     string  true   "Hotel UUID"
// @Param        cursor    query     string  false  "Pagination cursor (last seen user ID)"
// @Param        q         query     string  false  "Name search query"
// @Success      200   {object}  map[string]interface{}
// @Failure      400   {object}  errs.HTTPError
// @Failure      500   {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /users [get]
func (h *UsersHandler) SearchUsers(c *fiber.Ctx) error {
	q := SearchUsersQuery{
		HotelID: c.Query("hotel_id"),
		Cursor:  c.Query("cursor"),
		Query:   c.Query("q"),
	}
	if err := httpx.Validate(&q); err != nil {
		return err
	}

	users, nextCursor, err := h.UsersRepository.SearchUsersByHotel(c.Context(), q.HotelID, q.Cursor, q.Query, defaultUsersPageSize)
	if err != nil {
		slog.Error("failed to search users", "hotel_id", q.HotelID, "err", err)
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"users":       users,
		"next_cursor": nextCursor,
	})
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
// @Security     BearerAuth
// @Router       /users [post]
func (h *UsersHandler) CreateUser(c *fiber.Ctx) error {
	var CreateUserRequest models.CreateUser
	if err := httpx.BindAndValidate(c, &CreateUserRequest); err != nil {
		return err
	}

	res, err := h.UsersRepository.InsertUser(c.Context(), &CreateUserRequest)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}

// UpdateUser godoc
// @Summary      Update user
// @Description  Updates allowed fields on a user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id       path      string              true  "User ID"
// @Param        request  body      models.UpdateUser   true  "Fields to update"
// @Success      200      {object}  models.User
// @Failure      400      {object}  map[string]string
// @Failure      404      {object}  map[string]string
// @Failure      500      {object}  map[string]string
// @Security     BearerAuth
// @Router       /users/{id} [put]
func (h *UsersHandler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}
	var req models.UpdateUser
	if err := httpx.BindAndValidate(c, &req); err != nil {
		return err
	}
	user, err := h.UsersRepository.UpdateUser(c.Context(), id, &req)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("user", "id", id)
		}
		slog.Error(err.Error())
		return errs.InternalServerError()
	}
	return c.JSON(user)
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
	presignedURL, err := h.S3Storage.GeneratePresignedGetURL(c.Context(), models.PresignedURLInput{
		Key:        key,
		Expiration: 5 * time.Minute,
	})
	if err != nil {
		return err
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
	if err := httpx.BindAndValidate(c, &req); err != nil {
		return err
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

// CompleteOnboarding godoc
// @Summary      Complete user onboarding
// @Description  Saves onboarding data and marks a user as onboarded
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id       path  string              true  "User ID"
// @Param        request  body  models.OnboardUser  true  "Onboarding data"
// @Success      200  {object}  models.User
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /users/{id}/onboard [put]
func (h *UsersHandler) CompleteOnboarding(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return errs.BadRequest("id is required")
	}

	var req models.OnboardUser
	if err := httpx.BindAndValidate(c, &req); err != nil {
		return err
	}

	user, err := h.UsersRepository.CompleteOnboarding(c.Context(), id, &req)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("user", "id", id)
		}
		slog.Error("failed to complete onboarding", "id", id, "err", err.Error())
		return errs.InternalServerError()
	}

	return c.JSON(user)
}
