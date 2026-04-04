package aiflows

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
	"github.com/generate/selfserve/internal/aiflows/prompts"
)

func DefineGenerateRequest(genkitInstance *genkit.Genkit, model ai.Model, generationConfig *ai.GenerationCommonConfig, roomLookupRepo RoomLookupRepository) *core.Flow[GenerateRequestInput, GenerateRequestOutput, struct{}] {
	generateRequestFlow := genkit.DefineFlow(genkitInstance, "generateRequestFlow",
		func(ctx context.Context, input GenerateRequestInput) (GenerateRequestOutput, error) {
			prompt := fmt.Sprintf(prompts.GenerateRequestPrompt, input.RawText)
			resp, _, err := genkit.GenerateData[GenerateRequestOutput](ctx, genkitInstance, ai.WithPrompt(prompt), ai.WithModel(model), ai.WithConfig(generationConfig))
			if err != nil {
				return GenerateRequestOutput{}, err
			}

			output := *resp
			if output.RoomMentioned != nil && *output.RoomMentioned && output.RoomReference != nil {
				roomResult, err := LookupRoom(ctx, roomLookupRepo, RoomLookupInput{
					HotelID:       input.HotelID,
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
			}

			return output, nil
		},
	)

	return generateRequestFlow
}
