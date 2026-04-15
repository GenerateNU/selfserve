package aiflows

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
	"github.com/generate/selfserve/internal/aiflows/prompts"
	"google.golang.org/genai"
)

func DefineGenerateRequest(genkitInstance *genkit.Genkit, model ai.Model, generationConfig *genai.GenerateContentConfig, roomLookupRepo RoomLookupRepository) *core.Flow[GenerateRequestInput, GenerateRequestOutput, struct{}] {
	generateRequestFlow := genkit.DefineFlow(genkitInstance, "generateRequestFlow",
		func(ctx context.Context, input GenerateRequestInput) (GenerateRequestOutput, error) {
			prompt := fmt.Sprintf(prompts.GenerateRequestPrompt, input.RawText)
			resp, _, err := genkit.GenerateData[GenerateRequestOutput](ctx, genkitInstance, ai.WithPrompt(prompt), ai.WithModel(model), ai.WithConfig(generationConfig))
			if err != nil {
				return GenerateRequestOutput{}, err
			}

			return enrichWithRoomLookup(ctx, roomLookupRepo, input.HotelID, *resp)
		},
	)

	return generateRequestFlow
}

func enrichWithRoomLookup(ctx context.Context, roomLookupRepo RoomLookupRepository, hotelID string, output GenerateRequestOutput) (GenerateRequestOutput, error) {
	if output.RoomMentioned == nil || !*output.RoomMentioned || output.RoomReference == nil {
		return output, nil
	}

	roomResult, err := LookupRoom(ctx, roomLookupRepo, RoomLookupInput{
		HotelID:       hotelID,
		RoomReference: *output.RoomReference,
	})
	if err != nil {
		return GenerateRequestOutput{}, err
	}

	output.RoomID = roomResult.RoomID
	if roomResult.Message != nil {
		code := "room_not_found"
		if roomResult.Ambiguous {
			code = "room_ambiguous"
		}
		output.Warning = &GenerateRequestWarning{
			Code:    code,
			Message: *roomResult.Message,
		}
	}

	return output, nil
}
