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
} //@name UpdateGuest

type Guest struct {
	ID        string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-02T00:00:00Z"`
	CreateGuest
} //@name Guest

type GuestFilter struct {
	HotelID string 
    Floors *[]int `query:"floors"`
}

type GuestWithBooking struct {
	ID   string `json:"id" validate:"required"` 
	FirstName      string  `json:"first_name" validate:"required"`
	LastName      string  `json:"last_name" validate:"required"`
	Floor int      `json:"floor" validate:"required"`
	RoomNumber int  `json:"room_number" validate:"required"`
}

type GuestWithStays struct {
	ID             string  `json:"id" validate:"required" example:"530e8400-e458-41d4-a716-446655440000"`
	FirstName      string  `json:"first_name" validate:"required" example:"Jane"`
	LastName       string  `json:"last_name" validate:"required" example:"Doe"`
	Phone          *string `json:"phone,omitempty" example:"+1 (617) 012-3456"`
	Email          *string `json:"email,omitempty" validate:"omitempty,email" example:"jane.doe@example.com"`
	Preferences    *string `json:"preferences,omitempty" example:"extra pillows"`
	Notes          *string `json:"notes,omitempty" example:"VIP"`
	CurrentStays []Stay `json:"current_stays" validate:"required"`
	PastStays    []Stay `json:"past_stays" validate:"required"`
} //@name GuestWithStays


type Stay struct {
    ArrivalDate   string        `json:"arrival_date" validate:"required" example:"2024-01-02"`
    DepartureDate string        `json:"departure_date" validate:"required" example:"2024-01-05"`
    RoomNumber    int           `json:"room_number" validate:"required" example:"101"`
    Status        BookingStatus `json:"status" validate:"required"`
} //@name Stay

