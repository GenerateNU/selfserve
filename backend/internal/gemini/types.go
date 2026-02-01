package gemini

type MakeRequestFromTextInput struct {
	RawText string `json:"raw_text"`
}

type MakeRequestFromTextOutput struct {
    GuestID                  *string `json:"guest_id,omitempty"`
    UserID                   *string `json:"user_id,omitempty"`
    ReservationID            *string `json:"reservation_id,omitempty"`
    Name                     string  `json:"name"`
    Description              *string  `json:"description"`
    RoomID                   *string `json:"room_id,omitempty"`
    RequestCategory          *string  `json:"request_category"`
    RequestType              string  `json:"request_type"`
    Department               *string  `json:"department"`
    Status                   string  `json:"status"`
    Priority                 string  `json:"priority"`
    EstimatedCompletionTime  *int    `json:"estimated_completion_time,omitempty"`
    Notes                    *string `json:"notes,omitempty"`
}
