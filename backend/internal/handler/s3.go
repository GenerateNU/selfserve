package handler

import (
	"time"

	"github.com/generate/selfserve/internal/errs"
	s3storage "github.com/generate/selfserve/internal/service/s3"
	"github.com/gofiber/fiber/v2"
)

const expirationTime = 5 * time.Minute // Moved to a package level constant for reusability

type S3Handler struct {
	S3Storage *s3storage.Storage
}

func NewS3Handler(s3Storage *s3storage.Storage) *S3Handler {
	return &S3Handler{S3Storage: s3Storage}
}

// GeneratePresignedURL godoc
// @Summary      Generate a presigned URL for a file
// @Description  Generates a presigned URL for a file
// @Tags         s3
// @Accept       json
// @Produce      json
// @Param        key  path  string  true  "File key"
// @Success      200  {object}  map[string]string  "Presigned URL response"
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /s3/presigned-url/{key} [get]

func (h *S3Handler) GeneratePresignedURL(c *fiber.Ctx) error {
	key := c.Params("key")
	if key == "" {
		return errs.BadRequest("key is required")
	}

	presignedURL, err := h.S3Storage.GeneratePresignedURL(c.Context(), key, expirationTime)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"presigned_url": presignedURL,
	})
}
