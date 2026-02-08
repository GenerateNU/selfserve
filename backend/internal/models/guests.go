package models

import "time"

type CreateGuest struct {
	FirstName      string  `json:"first_name" validate:"notblank" example:"Jane"`
	LastName       string  `json:"last_name" validate:"notblank" example:"Doe"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
}

type UpdateGuest struct {
	FirstName      string  `json:"first_name" validate:"notblank" example:"Jane"`
	LastName       string  `json:"last_name" validate:"notblank" example:"Doe"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
}

type Guest struct {
	ID        string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-02T00:00:00Z"`
	CreateGuest
}
