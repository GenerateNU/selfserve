package models

import "time"

type CreateUser struct {
	ID             string  `json:"id" validate:"notblank" example:"user_123"`
	FirstName      string  `json:"first_name" validate:"notblank" example:"John"`
	LastName       string  `json:"last_name" validate:"notblank" example:"Doe"`
	HotelID        string  `json:"hotel_id" validate:"notblank" example:"550e8400-e29b-41d4-a716-446655440000"`
	EmployeeID     *string `json:"employee_id,omitempty" validate:"omitempty" example:"EMP-1234"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Role           *string `json:"role,omitempty" validate:"omitempty" example:"Receptionist"`
	Department     *string `json:"department,omitempty" validate:"omitempty" example:"Housekeeping"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
	PhoneNumber    *string `json:"phone_number,omitempty" validate:"omitempty" example:"+11234567890"`
	PrimaryEmail   *string `json:"primary_email,omitempty" validate:"omitempty,email" example:"john@example.com"`
} //@name CreateUser

// UpdateUser is the request body for PATCH/PUT user updates (partial fields).
type UpdateUser struct {
	PhoneNumber *string `json:"phone_number,omitempty" validate:"omitempty" example:"+11234567890"`
} //@name UpdateUser

type CreateUserWebhook struct {
	ClerkUser `json:"data"`
}

type ClerkUser struct {
	ID        string  `json:"id"`
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	ImageUrl  *string `json:"image_url"`
	HasImage  bool    `json:"has_image"`
}

type User struct {
	CreateUser
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
} //@name User
