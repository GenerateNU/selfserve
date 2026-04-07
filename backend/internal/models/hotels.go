package models

import "time"

type CreateHotelRequest struct {
	ID     string `json:"id" validate:"notblank" example:"org_2abc123"`
	Name   string `json:"name" validate:"notblank" example:"Hotel California"`
	Floors *int   `json:"floors,omitempty" validate:"omitempty,gte=1" example:"10"`
} //@name CreateHotelRequest

type Hotel struct {
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
	CreateHotelRequest
} //@name Hotel
