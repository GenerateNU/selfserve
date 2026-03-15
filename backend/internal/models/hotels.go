package models

import "time"

type CreateHotelRequest struct {
	Name       string `json:"name" validate:"notblank" example:"Hotel California"`
	Floors     int    `json:"floors" validate:"gte=1" example:"10"`
	ClerkOrgID string `json:"clerk_org_id" validate:"notblank" example:"org_2abc123"`
} //@name CreateHotelRequest

type Hotel struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
	CreateHotelRequest
} //@name Hotel
