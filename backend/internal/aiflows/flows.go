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

func DefineGenerateRequest(genkitInstance *genkit.Genkit, model ai.Model, generationConfig *genai.GenerateContentConfig, roomLookupRepo RoomLookupRepository, guestLookupRepo GuestLookupRepository, userLookupRepo UserLookupRepository) *core.Flow[GenerateRequestInput, EnrichedGenerateRequestOutput, struct{}] {
	generateRequestFlow := genkit.DefineFlow(genkitInstance, "generateRequestFlow",
		func(ctx context.Context, input GenerateRequestInput) (EnrichedGenerateRequestOutput, error) {
			prompt := fmt.Sprintf(prompts.GenerateRequestPrompt, input.RawText)
			resp, _, err := genkit.GenerateData[GenerateRequestOutput](ctx, genkitInstance, ai.WithPrompt(prompt), ai.WithModel(model), ai.WithConfig(generationConfig))
			if err != nil {
				return EnrichedGenerateRequestOutput{}, err
			}

			enriched := EnrichedGenerateRequestOutput{
				GenerateRequestOutput: *resp,
			}

			output, err := enrichWithRoomLookup(ctx, roomLookupRepo, input.HotelID, enriched)
			if err != nil {
				return EnrichedGenerateRequestOutput{}, err
			}

			output, err = enrichWithGuestLookup(ctx, guestLookupRepo, input.HotelID, output)
			if err != nil {
				return EnrichedGenerateRequestOutput{}, err
			}

			return enrichWithUserLookup(ctx, userLookupRepo, input.HotelID, output)
		},
	)

	return generateRequestFlow
}

func enrichWithRoomLookup(ctx context.Context, roomLookupRepo RoomLookupRepository, hotelID string, output EnrichedGenerateRequestOutput) (EnrichedGenerateRequestOutput, error) {
	if output.RoomMentioned == nil || !*output.RoomMentioned || output.RoomReference == nil {
		return output, nil
	}

	roomResult, err := LookupRoom(ctx, roomLookupRepo, RoomLookupInput{
		HotelID:       hotelID,
		RoomReference: *output.RoomReference,
	})
	if err != nil {
		return EnrichedGenerateRequestOutput{}, err
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

func enrichWithGuestLookup(ctx context.Context, guestLookupRepo GuestLookupRepository, hotelID string, output EnrichedGenerateRequestOutput) (EnrichedGenerateRequestOutput, error) {

	if output.GuestName == nil {
		return output, nil
	}

	guestID, warning, err := LookupGuest(ctx, guestLookupRepo, GuestLookupInput{
		HotelID:   hotelID,
		GuestName: *output.GuestName,
	})
	if err != nil {
		return EnrichedGenerateRequestOutput{}, err
	}

	output.GuestID = guestID
	if warning != nil {
		output.Warning = &GenerateRequestWarning{
			Code:    "guest_not_found",
			Message: *warning,
		}
	}

	return output, nil
}

func enrichWithUserLookup(ctx context.Context, userLookupRepo UserLookupRepository, hotelID string, output EnrichedGenerateRequestOutput) (EnrichedGenerateRequestOutput, error) {
	if output.UserName == nil {
		return output, nil
	}

	userID, warning, err := LookupUser(ctx, userLookupRepo, UserLookupInput{
		HotelID:  hotelID,
		UserName: *output.UserName,
	})
	if err != nil {
		return EnrichedGenerateRequestOutput{}, err
	}

	output.UserID = userID
	if warning != nil {
		output.Warning = &GenerateRequestWarning{
			Code:    "user_not_found",
			Message: *warning,
		}
	}

	return output, nil
}
