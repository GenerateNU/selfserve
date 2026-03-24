package handler

import (
	"fmt"
	"time"

	"github.com/generate/selfserve/internal/errs"
	s3storage "github.com/generate/selfserve/internal/service/s3"
	"github.com/gofiber/fiber/v2"
)

const expirationTime = 5 * time.Minute

type S3Handler struct {
	S3Storage *s3storage.Storage
}

func NewS3Handler(s3Storage *s3storage.Storage) *S3Handler {
	return &S3Handler{S3Storage: s3Storage}
}

// GeneratePresignedUploadURL godoc
// @Summary      Generate a presigned URL for a file
// @Description  Generates a presigned URL for a file. The key is the full S3 path (e.g., profile-pictures/user123/image.jpg)
// @Tags         s3
// @Accept       json
// @Produce      json
// @Param        key  path  string  true  "File key (full path after /presigned-url/)"
// @Success      200  {string}  string  "Presigned URL"
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /s3/presigned-url/{key} [get]
func (h *S3Handler) GeneratePresignedUploadURL(c *fiber.Ctx) error {
	key := c.Params("*")
	if key == "" {
		return errs.BadRequest("key is required")
	}

	presignedURL, err := h.S3Storage.GeneratePresignedUploadURL(c.Context(), key, expirationTime)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"presigned_url": presignedURL,
	})
}

// GetUploadURL godoc
// @Summary      Get presigned URL for profile picture upload
// @Description  Generates a presigned S3 URL and unique key for uploading a profile picture. After uploading to S3, use PUT /users/{userId}/profile-picture to save the key.
// @Tags         s3
// @Produce      json
// @Param        userId  path   string  true   "User ID"
// @Param        ext     query  string  false  "File extension (jpg, jpeg, png, webp)" default(jpg)
// @Success      200  {object}  map[string]string  "Returns presigned_url and key"
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /s3/upload-url/{userId} [get]
func (h *S3Handler) GetUploadURL(c *fiber.Ctx) error {
	userId := c.Params("userId")
	ext := c.Query("ext", "jpg")
	allowedExts := map[string]bool{"jpg": true, "jpeg": true, "png": true, "webp": true}
	if !allowedExts[ext] {
		return errs.BadRequest("invalid extension")
	}

	key := fmt.Sprintf("profile-pictures/%s/%d.%s", userId, time.Now().Unix(), ext)
	presignedURL, err := h.S3Storage.GeneratePresignedUploadURL(c.Context(), key, expirationTime)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"presigned_url": presignedURL,
		"key":           key,
	})
}

// GeneratePresignedGetURL godoc
// @Summary      Generate a presigned URL for a file
// @Description  Generates a presigned URL for a file. The key is the full S3 path (e.g., profile-pictures/user123/image.jpg)
// @Tags         s3
// @Accept       json
// @Produce      json
// @Param        key  path  string  true  "File key (full path after /presigned-url/)"
// @Success      200  {string}  string  "Presigned URL"
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /s3/presigned-get-url/{key} [get]
func (h *S3Handler) GeneratePresignedGetURL(c *fiber.Ctx) error {
	key := c.Params("*")
	if key == "" {
		return errs.BadRequest("key is required")
	}

	presignedURL, err := h.S3Storage.GeneratePresignedGetURL(c.Context(), key, expirationTime)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"presigned_url": presignedURL,
	})
}