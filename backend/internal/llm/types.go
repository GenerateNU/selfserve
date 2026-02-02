package llm

type ParseRequestInput struct {
	RawText string `json:"raw_text"`
}

type ParseRequestOutput struct {
	GuestID                 *string `json:"guest_id,omitempty"`
	UserID                  *string `json:"user_id,omitempty"`
	ReservationID           *string `json:"reservation_id,omitempty"`
	Name                    string  `json:"name"`
	Description             *string `json:"description,omitempty"`
	RoomID                  *string `json:"room_id,omitempty"`
	RequestCategory         *string `json:"request_category,omitempty"`
	RequestType             string  `json:"request_type"`
	Department              *string `json:"department,omitempty"`
	Status                  string  `json:"status"`
	Priority                string  `json:"priority"`
	EstimatedCompletionTime *int    `json:"estimated_completion_time,omitempty"`
	Notes                   *string `json:"notes,omitempty"`
}
