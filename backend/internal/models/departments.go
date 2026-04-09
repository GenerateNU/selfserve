package models

import "time"

var DefaultDepartments = []string{
	"Front Desk",
	"Housekeeping",
	"Maintenance",
	"Food & Beverage",
}

type Department struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	HotelID   string    `json:"hotel_id" example:"org_2abc123"`
	Name      string    `json:"name" example:"Housekeeping"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
} //@name Department
