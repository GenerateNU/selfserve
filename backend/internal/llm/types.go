package llm

type ParseRequestInput struct {
	RawText string `json:"raw_text"`
}

type ParseRequestOutput struct {
	GuestID                 *string `json:"guest_id,omitempty" jsonschema:"nullable,description=Guest ID if mentioned in the request"`
	UserID                  *string `json:"user_id,omitempty" jsonschema:"nullable,description=User ID if mentioned in the request"`
	ReservationID           *string `json:"reservation_id,omitempty" jsonschema:"nullable,description=Reservation ID if mentioned in the request"`
	Name                    string  `json:"name" jsonschema:"description=Brief name or title for the request (e.g. 'Extra Towels' or 'Fix Broken AC')"`
	Description             *string `json:"description,omitempty" jsonschema:"nullable,description=Detailed description of what the guest is requesting"`
	RoomID                  *string `json:"room_id,omitempty" jsonschema:"nullable,description=Room ID or room number if mentioned"`
	RequestCategory         *string `json:"request_category,omitempty" jsonschema:"nullable,enum=Cleaning,enum=Maintenance,enum=Amenity,enum=Food Service,description=Category of the request"`
	RequestType             string  `json:"request_type" jsonschema:"enum=one-time,enum=recurring,description=Whether the request is one-time or recurring"`
	Department              *string `json:"department,omitempty" jsonschema:"nullable,enum=housekeeping,enum=maintenance,enum=concierge,enum=room service,description=Department that should handle this request"`
	Status                  string  `json:"status" jsonschema:"enum=pending,enum=in_progress,enum=completed,enum=cancelled,description=Current status of the request"`
	Priority                string  `json:"priority" jsonschema:"enum=low,enum=medium,enum=high,enum=urgent,description=Priority level based on urgency"`
	EstimatedCompletionTime *int    `json:"estimated_completion_time,omitempty" jsonschema:"type=integer,nullable,description=Estimated time to complete in minutes"`
	Notes                   *string `json:"notes,omitempty" jsonschema:"nullable,description=Any additional notes or context about the request"`
}
