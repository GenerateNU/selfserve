package handler

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)

// HotelRepository defines methods for hotel data access
type HotelsRepository interface {
	FindByID(ctx context.Context, id string) (*models.Hotel, error)
	InsertHotel(ctx context.Context, hotel *models.CreateHotelRequest) (*models.Hotel, error)
	GetDepartmentsByHotelID(ctx context.Context, hotelID string) ([]*models.Department, error)
	InsertDepartment(ctx context.Context, hotelID, name string) (*models.Department, error)
	UpdateDepartment(ctx context.Context, id, hotelID, name string) (*models.Department, error)
	DeleteDepartment(ctx context.Context, id, hotelID string) error
}

type HotelsHandler struct {
	repo      HotelsRepository
	usersRepo storage.UsersRepository
}

func NewHotelsHandler(repo HotelsRepository, usersRepo storage.UsersRepository) *HotelsHandler {
	return &HotelsHandler{repo: repo, usersRepo: usersRepo}
}

// GetHotelByID retrieves a single hotel by its ID
// @Summary      Get hotel by ID
// @Description  Retrieve a hotel's details using its UUID
// @Tags         hotels
// @Param        id   path      string  true  "Hotel ID (UUID)"
// @Success      200  {object}  models.Hotel
// @Failure      400  {object}  errs.HTTPError  "Invalid hotel ID format"
// @Failure      404  {object}  errs.HTTPError  "Hotel not found"
// @Failure      500  {object}  errs.HTTPError  "Internal server error"
// @Security     BearerAuth
// @Router       /hotels/{id} [get]
func (h *HotelsHandler) GetHotelByID(c *fiber.Ctx) error {
	idParam := c.Params("id")

	if strings.TrimSpace(idParam) == "" {
		return errs.BadRequest("hotel id is required")
	}

	// Fetch hotel
	hotel, err := h.repo.FindByID(c.Context(), idParam)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("hotel", "id", idParam)
		}
		return errs.InternalServerError()
	}

	return c.Status(fiber.StatusOK).JSON(hotel)
}

// GetHotelUsers godoc
// @Summary      Get users by hotel
// @Description  Returns a paginated list of all users for a hotel
// @Tags         hotels
// @Produce      json
// @Param        id      path      string  true   "Hotel ID"
// @Param        cursor  query     string  false  "Pagination cursor (last seen user ID)"
// @Success      200     {object}  map[string]interface{}
// @Failure      400     {object}  errs.HTTPError
// @Failure      500     {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /hotels/{id}/users [get]
func (h *HotelsHandler) GetHotelUsers(c *fiber.Ctx) error {
	hotelID := c.Params("id")
	if strings.TrimSpace(hotelID) == "" {
		return errs.BadRequest("hotel id is required")
	}
	cursor := c.Query("cursor")

	const pageSize = 20
	users, nextCursor, err := h.usersRepo.GetUsersByHotel(c.Context(), hotelID, cursor, pageSize)
	if err != nil {
		slog.Error("failed to get hotel users", "hotel_id", hotelID, "err", err)
		slog.Error(err.Error())
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"users":       users,
		"next_cursor": nextCursor,
	})
}

// GetDepartmentsByHotelID godoc
// @Summary      Get departments by hotel
// @Description  Returns all departments for a hotel
// @Tags         hotels
// @Produce      json
// @Param        id  path      string  true  "Hotel ID"
// @Success      200  {array}   models.Department
// @Failure      400  {object}  errs.HTTPError
// @Failure      500  {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /hotels/{id}/departments [get]
func (h *HotelsHandler) GetDepartmentsByHotelID(c *fiber.Ctx) error {
	hotelID := c.Params("id")
	if strings.TrimSpace(hotelID) == "" {
		return errs.BadRequest("hotel id is required")
	}

	departments, err := h.repo.GetDepartmentsByHotelID(c.Context(), hotelID)
	if err != nil {
		slog.Error("failed to get departments", "hotel_id", hotelID, "err", err)
		return errs.InternalServerError()
	}

	return c.JSON(departments)
}

// CreateDepartment godoc
// @Summary      Create department
// @Description  Adds a new department to a hotel
// @Tags         hotels
// @Accept       json
// @Produce      json
// @Param        id       path      string                    true  "Hotel ID"
// @Param        request  body      models.CreateDepartment   true  "Department data"
// @Success      201      {object}  models.Department
// @Failure      400      {object}  errs.HTTPError
// @Failure      500      {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /hotels/{id}/departments [post]
func (h *HotelsHandler) CreateDepartment(c *fiber.Ctx) error {
	if err := requireAdmin(c, h.usersRepo); err != nil {
		return err
	}

	hotelID := c.Params("id")
	if strings.TrimSpace(hotelID) == "" {
		return errs.BadRequest("hotel id is required")
	}

	var req models.CreateDepartment
	if err := httpx.BindAndValidate(c, &req); err != nil {
		return err
	}

	dept, err := h.repo.InsertDepartment(c.Context(), hotelID, req.Name)
	if err != nil {
		slog.Error("failed to create department", "hotel_id", hotelID, "err", err)
		return errs.InternalServerError()
	}

	return c.Status(fiber.StatusCreated).JSON(dept)
}

// UpdateDepartment godoc
// @Summary      Update department
// @Description  Renames a department
// @Tags         hotels
// @Accept       json
// @Produce      json
// @Param        id      path      string                    true  "Hotel ID"
// @Param        deptId  path      string                    true  "Department ID"
// @Param        request body      models.UpdateDepartment   true  "Department data"
// @Success      200     {object}  models.Department
// @Failure      400     {object}  errs.HTTPError
// @Failure      404     {object}  errs.HTTPError
// @Failure      500     {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /hotels/{id}/departments/{deptId} [put]
func (h *HotelsHandler) UpdateDepartment(c *fiber.Ctx) error {
	hotelID := c.Params("id")
	deptID := c.Params("deptId")
	if strings.TrimSpace(hotelID) == "" {
		return errs.BadRequest("hotel id is required")
	}
	if strings.TrimSpace(deptID) == "" {
		return errs.BadRequest("department id is required")
	}

	var req models.UpdateDepartment
	if err := httpx.BindAndValidate(c, &req); err != nil {
		return err
	}

	dept, err := h.repo.UpdateDepartment(c.Context(), deptID, hotelID, req.Name)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("department", "id", deptID)
		}
		slog.Error("failed to update department", "dept_id", deptID, "err", err)
		return errs.InternalServerError()
	}

	return c.JSON(dept)
}

// DeleteDepartment godoc
// @Summary      Delete department
// @Description  Removes a department from a hotel
// @Tags         hotels
// @Produce      json
// @Param        id      path      string  true  "Hotel ID"
// @Param        deptId  path      string  true  "Department ID"
// @Success      204
// @Failure      400     {object}  errs.HTTPError
// @Failure      404     {object}  errs.HTTPError
// @Failure      500     {object}  errs.HTTPError
// @Security     BearerAuth
// @Router       /hotels/{id}/departments/{deptId} [delete]
func (h *HotelsHandler) DeleteDepartment(c *fiber.Ctx) error {
	hotelID := c.Params("id")
	deptID := c.Params("deptId")
	if strings.TrimSpace(hotelID) == "" {
		return errs.BadRequest("hotel id is required")
	}
	if strings.TrimSpace(deptID) == "" {
		return errs.BadRequest("department id is required")
	}

	if err := h.repo.DeleteDepartment(c.Context(), deptID, hotelID); err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return errs.NotFound("department", "id", deptID)
		}
		slog.Error("failed to delete department", "dept_id", deptID, "err", err)
		return errs.InternalServerError()
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// CreateHotel creates a new hotel
// @Summary      Create hotel
// @Description  Create a new hotel with the given data
// @Tags         hotels
// @Accept       json
// @Produce      json
// @Param        hotel  body      models.Hotel  true  "Hotel data"
// @Success      201    {object}  models.Hotel
// @Failure      400    {object}  map[string]string
// @Failure      500    {object}  map[string]string
// @Security     BearerAuth
// @Router       /hotels [post]
func (h *HotelsHandler) CreateHotel(c *fiber.Ctx) error {
	var hotelRequest models.CreateHotelRequest

	if err := c.BodyParser(&hotelRequest); err != nil {
		return errs.InvalidJSON()
	}

	if err := httpx.BindAndValidate(c, &hotelRequest); err != nil {
		return err
	}

	createdHotel, err := h.repo.InsertHotel(c.Context(), &hotelRequest)
	if err != nil {
		slog.Error("failed to create hotel", "error", err.Error())
		return errs.InternalServerError()
	}

	return c.Status(fiber.StatusCreated).JSON(createdHotel)
}
