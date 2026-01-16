package models

import "time"

type User struct {
	ID             string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	FirstName      string    `json:"first_name" example:"John"`
	LastName       string    `json:"last_name" example:"Doe"`
	EmployeeID     *string   `json:"employee_id" example:"EMP-001"`
	ProfilePicture *string   `json:"profile_picture" example:"https://..."` 
	Role           string    `json:"role" example:"admin"`
	Department     *string   `json:"department" example:"Engineering"` 
	Timezone       string    `json:"timezone" example:"UTC"`
	CreatedAt      time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt      time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
}
