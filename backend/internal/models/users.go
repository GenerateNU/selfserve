package models

import "time"

type CreateUser struct {
	ID             string  `json:"id" validate:"notblank" example:"user_123"`
	FirstName      string  `json:"first_name" validate:"notblank" example:"John"`
	LastName       string  `json:"last_name" validate:"notblank" example:"Doe"`
	EmployeeID     *string `json:"employee_id,omitempty" validate:"omitempty" example:"EMP-1234"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Role           *string `json:"role,omitempty" validate:"omitempty" example:"Receptionist"`
	Department     *string `json:"department,omitempty" validate:"omitempty" example:"Housekeeping"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
	ClerkID        string  `json:"clerk_id" validate:"notblank" example:"user_123"`
} //@name CreateUser

type CreateUserWebhook struct {
	ClerkUser `json:"data"`
}

type ClerkUser struct {
	ID        string  `json:"id" example:"user123402"`
	FirstName string  `json:"first_name" example:"John"`
	LastName  string  `json:"last_name" example:"Doe"`
	ImageUrl  *string `json:"image_url" example:"https://photo.com/john.jpg"`
	HasImage  bool    `json:"has_image" example:"true"`
}

type User struct {
	CreateUser
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
} //@name User
