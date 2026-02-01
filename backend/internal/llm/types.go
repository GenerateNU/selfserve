package llm

type MakeRequestFromTextInput struct {
	RawText string `json:"raw_text"`
}

type MakeRequestFromTextOutput struct {
    GuestID                  *string `json:"guest_id,omitempty" jsonschema:"nullable"`
    UserID                   *string `json:"user_id,omitempty" jsonschema:"nullable"`
    ReservationID            *string `json:"reservation_id,omitempty" jsonschema:"nullable"`
    Name                     string  `json:"name"`
    Description              *string `json:"description"`
    RoomID                   *string `json:"room_id,omitempty" jsonschema:"nullable"`
    RequestCategory          *string `json:"request_category" jsonschema:"nullable"`
    RequestType              string  `json:"request_type"`
    Department               *string `json:"department" jsonschema:"nullable"`
    Status                   string  `json:"status"`
    Priority                 string  `json:"priority"`
    EstimatedCompletionTime  *int    `json:"estimated_completion_time,omitempty" jsonschema:"nullable"`
    Notes                    *string `json:"notes,omitempty" jsonschema:"nullable"`
}
