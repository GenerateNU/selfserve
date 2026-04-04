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
	GuestID                 *string                 `json:"guest_id,omitempty"`
	UserID                  *string                 `json:"user_id,omitempty"`
	ReservationID           *string                 `json:"reservation_id,omitempty"`
	Name                    string                  `json:"name"`
	Description             *string                 `json:"description,omitempty"`
	RoomID                  *string                 `json:"room_id,omitempty"`
	RequestCategory         *string                 `json:"request_category,omitempty"`
	RequestType             string                  `json:"request_type"`
	Department              *string                 `json:"department,omitempty"`
	Status                  string                  `json:"status"`
	Priority                string                  `json:"priority"`
	EstimatedCompletionTime *int                    `json:"estimated_completion_time,omitempty"`
	Notes                   *string                 `json:"notes,omitempty"`
	RoomMentioned           *bool                   `json:"room_mentioned,omitempty"`
	RoomReference           *string                 `json:"room_reference,omitempty"`
	Warning                 *GenerateRequestWarning `json:"warning,omitempty"`
}
