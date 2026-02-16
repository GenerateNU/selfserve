package models

import "time"

type CreateHotelRequest struct {
	Name   string `json:"name" validate:"notblank" example:"Hotel California"`
	Floors int    `json:"floors" validate:"gt=1" example:"10"`
} //@name CreateHotelRequest

type Hotel struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a	716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
	CreateHotelRequest
} //@name Hotel
