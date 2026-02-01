package gemini

import (
	"context"
	"fmt"
	"strings"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
	"github.com/google/uuid"
)

// FlowSet contains all the Genkit flows
type FlowSet struct {
	MakeRequestFromTextFlow *core.Flow[MakeRequestFromTextInput, MakeRequestFromTextOutput, struct{}]
}

func initFlowSet(g *genkit.Genkit) *FlowSet {
	makeRequestFromTextFlow := genkit.DefineFlow(g, "makeRequestFromText",
		func(ctx context.Context, input MakeRequestFromTextInput) (MakeRequestFromTextOutput, error) {
			prompt := fmt.Sprintf(`You are a hotel request parser. Parse the following text into a structured hotel service request:

Text: "%s"

CRITICAL: If you cannot determine a field's value from the text, you MUST omit it entirely from your response. DO NOT use placeholder values like "unknown_guest", "unknown_user", or the string "null".

Extract ONLY the following information that you can find in the text:
- guest_id: UUID of the guest (omit if not mentioned)
- user_id: UUID of the staff member (omit if not mentioned)
- reservation_id: UUID of the reservation (omit if not mentioned)
- name: Brief title/summary of the request (required)
- description: Detailed description of what is needed
- room_id: UUID of the room (extract from text like "room 504")
- request_category: Category like "Cleaning", "Maintenance", "Amenity", "Food Service"
- request_type: Either "one-time" or "recurring"
- department: Department to handle this like "housekeeping", "maintenance", "concierge", "room service"
- status: Set to "pending" for new requests
- priority: Either "low", "normal", "high", or "urgent" based on urgency indicators
- estimated_completion_time: Estimated minutes to complete (as integer)
- notes: Any additional context or special instructions

Example: If guest_id is not mentioned in the text, do not include it in your response.`, input.RawText)

			resp, _, err := genkit.GenerateData[MakeRequestFromTextOutput](ctx, g, ai.WithPrompt(prompt))
			if err != nil {
				return MakeRequestFromTextOutput{}, err
			}

			// Sanitize LLM-generated placeholder values - ensure UUIDs are valid or nil
			resp.GuestID = sanitizeUUIDPtr(resp.GuestID)
			resp.UserID = sanitizeUUIDPtr(resp.UserID)
			resp.ReservationID = sanitizeUUIDPtr(resp.ReservationID)
			resp.RoomID = sanitizeUUIDPtr(resp.RoomID)
			
			// Sanitize string fields
			resp.Description = sanitizeStringPtr(resp.Description)
			resp.RequestCategory = sanitizeStringPtr(resp.RequestCategory)
			resp.Department = sanitizeStringPtr(resp.Department)
			resp.Notes = sanitizeStringPtr(resp.Notes)

			if resp.EstimatedCompletionTime != nil && *resp.EstimatedCompletionTime == 0 {
				resp.EstimatedCompletionTime = nil
			}

			fmt.Println("resp", resp)
			return *resp, nil
		})

	return &FlowSet{
		MakeRequestFromTextFlow: makeRequestFromTextFlow,
	}
}

func sanitizeStringPtr(s *string) *string {
	if s == nil {
		return nil
	}
	val := strings.TrimSpace(*s)
	if val == "null" || val == "nil" || val == "" || strings.HasPrefix(val, "unknown_") {
		return nil
	}
	return &val
}

func sanitizeUUIDPtr(s *string) *string {
	if s == nil {
		return nil
	}
	val := strings.TrimSpace(*s)
	// If the value is empty, a placeholder, or not a valid UUID, return nil
	if val == "" || val == "null" || val == "nil" || strings.HasPrefix(val, "unknown_") {
		return nil
	}
	// Validate that it's actually a UUID
	if _, err := uuid.Parse(val); err != nil {
		return nil
	}
	return &val
}
