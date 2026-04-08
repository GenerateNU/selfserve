package models

import "time"

// PresignedURLInput is the input for generating S3 presigned upload/get URLs.
type PresignedURLInput struct {
	Key        string        `json:"key" validate:"notblank" example:"profile-pictures/user123/1706540000.jpg"`
	Expiration time.Duration `json:"expiration" validate:"gt=0" swaggertype:"integer" example:"300000000000"`
} //@name PresignedURLInput
