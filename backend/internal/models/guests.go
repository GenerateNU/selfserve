package models

import "time"

type CreateGuest struct {
	FirstName      string  `json:"first_name" example:"John"`
	LastName       string  `json:"last_name" example:"Doe"`
	ProfilePicture *string `json:"profile_picture" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone" example:"America/New_York"`
} //@name CreateGuest

type UpdateGuest struct {
	FirstName      string  `json:"first_name" example:"John"`
	LastName       string  `json:"last_name" example:"Doe"`
	ProfilePicture *string `json:"profile_picture" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone" example:"America/New_York"`
} //@name UpdateGuest

type Guest struct {
	ID        string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-02T00:00:00Z"`
	CreateGuest
} //@name Guest
