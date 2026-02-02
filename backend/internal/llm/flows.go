package llm

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

// FlowSet contains all the Genkit flows
type FlowSet struct {
	MakeRequestFromTextFlow *core.Flow[MakeRequestFromTextInput, MakeRequestFromTextOutput, struct{}]
}

func initFlowSet(g *genkit.Genkit, model ai.Model) *FlowSet {
	makeRequestFromTextFlow := genkit.DefineFlow(g, "makeRequestFromText",
		func(ctx context.Context, input MakeRequestFromTextInput) (MakeRequestFromTextOutput, error) {
			prompt := fmt.Sprintf(`Parse this hotel service request into JSON.

Text: "%s"

Output a JSON object with these fields (omit any field you cannot determine from the text):
- name: string (required) - brief title of the request
- description: string - detailed description
- request_category: string - one of "Cleaning", "Maintenance", "Amenity", "Food Service"
- request_type: string - "one-time" or "recurring"
- department: string - "housekeeping", "maintenance", "concierge", or "room service"
- status: string - always "pending"
- priority: string - "low", "normal", "high", or "urgent"
- estimated_completion_time: integer - minutes to complete
- notes: string - additional context

IMPORTANT: Output ONLY the JSON object. No markdown, no code blocks, no explanations, no text before or after. Just the raw JSON starting with { and ending with }.`, input.RawText)

			resp, _, err := genkit.GenerateData[MakeRequestFromTextOutput](ctx, g, ai.WithModel(model), ai.WithPrompt(prompt))
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

			return *resp, nil
		})

	return &FlowSet{
		MakeRequestFromTextFlow: makeRequestFromTextFlow,
	}
}
