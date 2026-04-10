package models

import (
	"encoding/json"
	"fmt"
	"time"
)

type GuestDocument struct {
	ID            string    `json:"id"`
	HotelID       string    `json:"hotel_id"`
	FullName      string    `json:"full_name"`
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	PreferredName string    `json:"preferred_name"`
	Email         *string   `json:"email,omitempty"`
	Phone         *string   `json:"phone,omitempty"`
	Preferences   *string   `json:"preferences,omitempty"`
	Notes         *string   `json:"notes,omitempty"`
	Floor         int       `json:"floor"`
	RoomNumber    int       `json:"room_number"`
	GroupSize     *int      `json:"group_size,omitempty"`
	BookingStatus string    `json:"booking_status"`
	ArrivalDate   time.Time `json:"arrival_date"`
	DepartureDate time.Time `json:"departure_date"`
} //@name GuestDocument

type CreateGuest struct {
	FirstName      string  `json:"first_name" validate:"notblank" example:"Jane"`
	LastName       string  `json:"last_name" validate:"notblank" example:"Doe"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
} // @name CreateGuest

type UpdateGuest struct {
	FirstName      *string `json:"first_name,omitempty" validate:"omitempty,notblank" example:"Jane"`
	LastName       *string `json:"last_name,omitempty" validate:"omitempty,notblank" example:"Doe"`
	ProfilePicture *string `json:"profile_picture,omitempty" validate:"omitempty,url" example:"https://example.com/john.jpg"`
	Timezone       *string `json:"timezone,omitempty" validate:"omitempty,timezone" example:"America/New_York"`
	Notes          *string `json:"notes,omitempty" validate:"omitempty,max=1000" example:"VIP guest"`
} //@name UpdateGuest

type Guest struct {
	ID        string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-02T00:00:00Z"`
	Notes     *string   `json:"notes,omitempty" example:"VIP guest"`
	CreateGuest
} //@name Guest

type GuestFilters struct {
	HotelID    string `json:"hotel_id" validate:"required,startswith=org_" swaggerignore:"true"`
	Floors     []int  `json:"floors"`
	GroupSize  []int  `json:"group_size"`
	Search     string `json:"search"`
	Cursor     string `json:"cursor"`
	CursorName string `json:"-"`
	CursorID   string `json:"-"`
	Limit      int    `json:"limit" validate:"omitempty,min=1,max=100"`
} // @name GuestFilters

type GuestPage struct {
	Data       []*GuestWithBooking `json:"data"`
	NextCursor *string             `json:"next_cursor"`
} // @name GuestPage

type GuestWithBooking struct {
	ID            string `json:"id" validate:"required" example:"530e8400-e458-41d4-a716-446655440000"`
	FirstName     string `json:"first_name" validate:"required" example:"Jane"`
	LastName      string `json:"last_name" validate:"required" example:"Doe"`
	PreferredName string `json:"preferred_name" validate:"required" example:"Jane"`
	Floor         int    `json:"floor" validate:"required" example:"3"`
	RoomNumber    int    `json:"room_number" validate:"required" example:"301"`
	GroupSize     *int   `json:"group_size" example:"2"`
} // @name GuestWithBooking

type GuestWithStays struct {
	ID                  string      `json:"id" validate:"required" example:"530e8400-e458-41d4-a716-446655440000"`
	FirstName           string      `json:"first_name" validate:"required" example:"Jane"`
	LastName            string      `json:"last_name" validate:"required" example:"Doe"`
	Phone               *string     `json:"phone,omitempty" example:"+1 (617) 012-3456"`
	Email               *string     `json:"email,omitempty" validate:"omitempty,email" example:"jane.doe@example.com"`
	Preferences         *string     `json:"preferences,omitempty" example:"extra pillows"`
	Notes               *string     `json:"notes,omitempty" example:"VIP"`
	Pronouns            *string     `json:"pronouns,omitempty" example:"she/her"`
	DoNotDisturbStart   *string     `json:"do_not_disturb_start,omitempty" example:"17:00:00"`
	DoNotDisturbEnd     *string     `json:"do_not_disturb_end,omitempty" example:"07:00:00"`
	HousekeepingCadence *string     `json:"housekeeping_cadence,omitempty" example:"daily"`
	Assistance          *Assistance `json:"assistance,omitempty"`
	CurrentStays        []Stay      `json:"current_stays" validate:"required"`
	PastStays           []Stay      `json:"past_stays" validate:"required"`
} //@name GuestWithStays

type Stay struct {
	ArrivalDate   time.Time     `json:"arrival_date" validate:"required" example:"2024-01-02"`
	DepartureDate time.Time     `json:"departure_date" validate:"required" example:"2024-01-05"`
	RoomNumber    int           `json:"room_number" validate:"required" example:"101"`
	GroupSize     *int          `json:"group_size,omitempty"`
	Status        BookingStatus `json:"status" validate:"required"`
} //@name Stay

type Assistance struct {
	Accessibility []string `json:"accessibility"`
	Dietary       []string `json:"dietary"`
	Medical       []string `json:"medical"`
} //@name Assistance

func (a *Assistance) Scan(src any) error {
	if src == nil {
		return nil
	}
	rawBytes, ok := src.([]byte)
	if !ok {
		return fmt.Errorf("Assistance.Scan: expected []byte from JSONB column, got %T", src)
	}
	if err := json.Unmarshal(rawBytes, a); err != nil {
		return fmt.Errorf("Assistance.Scan: failed to unmarshal JSONB into Assistance: %w", err)
	}
	return nil
}
