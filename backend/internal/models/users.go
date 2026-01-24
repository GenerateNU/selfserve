package models

import "time"

type CreateUser struct {
	FirstName      string  `json:"first_name" example:"John"`
	LastName       string  `json:"last_name" example:"Doe"`
	EmployeeID     *string `json:"employee_id" example:"EMP-1234"`
	ProfilePicture *string `json:"profile_picture" example:"https://example.com/john.jpg"`
	Role           *string  `json:"role" example:"Receptionist"`
	Department     *string `json:"department" example:"Housekeeping"`
	Timezone       *string `json:"timezone" example:"America/New_York"`
	ClerkID         string  `json:"clerk_id" example:"user_123"`
}

type CreateUserWebhook struct {
	Data struct {
        ID        string  `json:"id" example:"user123402"`
		FirstName string  `json:"first_name" example:"John"`
		LastName  string  `json:"last_name" example:"Doe"`
		ImageUrl  *string `json:"image_url" example:"https://photo.com/john.jpg"`
		HasImage  bool    `json:"has_image" example:"true"`
    } `json:"data"`
}

type User struct {
	ID        string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-02T00:00:00Z"`
	CreateUser
}
