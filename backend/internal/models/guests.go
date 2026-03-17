package models

import "time"

type CreateGuest struct {
	FirstName      string  `json:"first_name" validate:"notblank" example:"Jane"`
	LastName       string  `json:"last_name" validate:"notblank" example:"Doe"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
} //@name CreateGuest

type UpdateGuest struct {
	FirstName      string  `json:"first_name" validate:"notblank" example:"Jane"`
	LastName       string  `json:"last_name" validate:"notblank" example:"Doe"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
} //@name UpdateGuest

type Guest struct {
	ID        string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-02T00:00:00Z"`
	CreateGuest
} //@name Guest

type GuestSearchFilter struct {
	Floors       *[]int  `json:"floors" example:"[1, 2, 3]"`
	GroupSizeMin *int    `json:"group_size_min" example:"2"`
	GroupSizeMax *int    `json:"group_size_max" example:"4"`
	SearchTerm   *string `json:"search_term" example:"Jane"`
	Cursor       *string `json:"cursor" example:""`
	Limit        int     `json:"limit" example:"10"`
}

type GuestListItem struct {
	GuestID        string `json:"guest_id" example:"530e8400-e458-41d4-a716-446655440000"`
	GovernmentName string `json:"government_name" example:"Jane Doe"`
	PreferredName  string `json:"preferred_name" example:"Jane"`
	Floor          int    `json:"floor" example:"1"`
	RoomNumber     int    `json:"room_number" example:"101"`
	GroupSize      int    `json:"group_size" example:"2"`
}
