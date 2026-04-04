package handler

import (
	"context"
	"errors"
	"log/slog"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
)

type UsersRepository interface {
	FindUser(ctx context.Context, id string) (*models.User, error)
	InsertUser(ctx context.Context, user *models.CreateUser) (*models.User, error)
	UpdateUser(ctx context.Context, id string, update *models.UpdateUser) (*models.User, error)
	SearchUsersByHotel(ctx context.Context, hotelID, cursor, query string, limit int) ([]*models.User, string, error)
}

const defaultUsersPageSize = 20

type UsersHandler struct {
	repo UsersRepository
}

func NewUsersHandler(repo UsersRepository) *UsersHandler {
	return &UsersHandler{repo: repo}
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
	user, err := h.repo.FindUser(c.Context(), id)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("user", "id", id)
		}
		slog.Error(err.Error())
		return errs.InternalServerError()
	}
	return c.JSON(user)
}

// UpdateUser godoc
// @Summary      Updates a user
// @Description  Updates fields on a user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id  path   string  true  "User ID"
// @Param        request  body  models.UpdateUser  true  "User update data"
// @Success      200   {object}  models.User
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Security     BearerAuth
// @Router       /users/{id} [put]
func (h *UsersHandler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")

	var updateUserRequest models.UpdateUser
	if err := httpx.BindAndValidate(c, &updateUserRequest); err != nil {
		return err
	}

	user, err := h.repo.UpdateUser(c.Context(), id, &updateUserRequest)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("user", "id", id)
		}
		slog.Error("failed to update user", "id", id, "err", err.Error())
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
	hotelID := c.Query("hotel_id")
	if hotelID == "" {
		return errs.BadRequest("hotel_id is required")
	}
	cursor := c.Query("cursor")
	query := c.Query("q")

	users, nextCursor, err := h.repo.SearchUsersByHotel(c.Context(), hotelID, cursor, query, defaultUsersPageSize)
	if err != nil {
		slog.Error("failed to search users", "hotel_id", hotelID, "err", err)
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
	if err := c.BodyParser(&CreateUserRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := httpx.BindAndValidate(c, &CreateUserRequest); err != nil {
		return err
	}

	res, err := h.repo.InsertUser(c.Context(), &CreateUserRequest)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(res)
}
