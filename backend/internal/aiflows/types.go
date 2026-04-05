package aiflows

type GenerateRequestInput struct {
	RawText string `json:"raw_text"`
	HotelID string `json:"hotel_id"`
}

type GenerateRequestWarning struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type RoomLookupInput struct {
	HotelID       string `json:"hotel_id"`
	RoomReference string `json:"room_reference"`
}

type RoomLookupResult struct {
	Matched   bool    `json:"matched"`
	Ambiguous bool    `json:"ambiguous"`
	Message   *string `json:"message,omitempty"`
	RoomID    *string `json:"room_id,omitempty"`
}

type GenerateRequestOutput struct {
	GuestID                 *string                 `json:"guest_id,omitempty" validate:"omitempty,uuid"`
	UserID                  *string                 `json:"user_id,omitempty" validate:"omitempty,uuid"`
	ReservationID           *string                 `json:"reservation_id,omitempty" validate:"omitempty,uuid"`
	Name                    string                  `json:"name" validate:"notblank"`
	Description             *string                 `json:"description,omitempty"`
	RoomID                  *string                 `json:"room_id,omitempty" validate:"omitempty,uuid"`
	RequestCategory         *string                 `json:"request_category,omitempty"`
	RequestType             string                  `json:"request_type" validate:"notblank"`
	Department              *string                 `json:"department,omitempty"`
	Status                  string                  `json:"status" validate:"oneof='pending' 'assigned' 'in progress' 'completed'"`
	Priority                string                  `json:"priority" validate:"oneof=low medium high"`
	EstimatedCompletionTime *int                    `json:"estimated_completion_time,omitempty"`
	Notes                   *string                 `json:"notes,omitempty"`
	RoomMentioned           *bool                   `json:"room_mentioned,omitempty"`
	RoomReference           *string                 `json:"room_reference,omitempty"`
	Warning                 *GenerateRequestWarning `json:"warning,omitempty"`
}
