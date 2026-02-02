package handler

import (
	"time"
	"fmt"
    "github.com/generate/selfserve/internal/errs"
	s3storage "github.com/generate/selfserve/internal/service/storage/postgres/s3"
	"github.com/gofiber/fiber/v2"

)
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
// @Success      200  {string}  string  "Presigned URL"
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /s3/presigned-url/{key} [get]

func (h *S3Handler) GeneratePresignedURL(c *fiber.Ctx) error {
	key := c.Params("key")
	if key == "" {
		return errs.BadRequest("key is required")
	}

	presignedURL, err := h.S3Storage.GeneratePresignedURL(c.Context(), key, 5*time.Minute)
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
	// Used for the upload's extension type. Defaults to jpg
	// when client doesn't provide anything.
	// Supported formats: jpg, jpeg, png, webp
	ext := c.Query("ext", "jpg")
	allowedExts := map[string]bool{"jpg": true, "jpeg": true, "png": true,  "webp": true}
	if !allowedExts[ext] {
		return errs.BadRequest("invalid extension")
	}

	key := fmt.Sprintf("profile-pictures/%s/%d.%s", userId, time.Now().Unix(), ext)
	presignedURL, err := h.S3Storage.GeneratePresignedURL(c.Context(), key, 5*time.Minute)
	if err != nil {
		return errs.InternalServerError()
	}

	return c.JSON(fiber.Map{
		"presigned_url": presignedURL,
		"key": key,
	})
}
