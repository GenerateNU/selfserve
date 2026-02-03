package models

import "time"

// pointer fields are for easy handling of optional fields

// for post because the ID and timestamps should always be generated
type MakeRequest struct {
	HotelID                 string     `json:"hotel_id" example:"521e8400-e458-41d4-a716-446655440000"`
	GuestID                 *string    `json:"guest_id" example:"521e8417-e458-41d4-a716-446655440990"`
	UserID                  *string    `json:"user_id" example:"521ee400-e458-41d4-a716-446655440000"`
	ReservationID           *string    `json:"reservation_id" example:"521e8400-e458-41d4-a716-498655440000"`
	Name                    string     `json:"name" example:"room cleaning"`
	Description             *string    `json:"description" example:"clean 504"`
	RoomID                  *string    `json:"room_id" example:"521e8422-e458-41d4-a716-446655440000"`
	RequestCategory         *string    `json:"request_category" example:"Cleaning"`
	RequestType             string     `json:"request_type" example:"recurring"`
	Department              *string    `json:"department" example:"maintenance"`
	Status                  string     `json:"status" example:"assigned"`
	Priority                string     `json:"priority" example:"urgent"`
	EstimatedCompletionTime *int       `json:"estimated_completion_time" example:"30"`
	ScheduledTime           *time.Time `json:"scheduled_time" example:"2024-01-01T00:00:00Z"`
	CompletedAt             *time.Time `json:"completed_at" example:"2024-01-01T00:30:00Z"`
	Notes                   *string    `json:"notes" example:"No special requests"`
}

type GenerateRequestInput struct {
	RawText string `json:"raw_text" example:"Guest in room 504 needs extra towels urgently"`
	HotelID string `json:"hotel_id" example:"521e8400-e458-41d4-a716-446655440000"`
}

type Request struct {
	ID        string    `json:"id" example:"530e8400-e458-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-02T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-02T00:00:00Z"`
	MakeRequest
}
