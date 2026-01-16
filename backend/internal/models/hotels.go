package models

import "time"

type MakeHotel struct {
	Name   string `json:"name" example:"Hotel California"`
	Floors int    `json:"floors" example:"10"`
}

type Hotel struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a	716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
	MakeHotel
}
