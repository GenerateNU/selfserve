package aiflows

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
	"github.com/generate/selfserve/internal/aiflows/prompts"
	"github.com/generate/selfserve/internal/models"
	"google.golang.org/genai"
)

func DefineGenerateRequest(genkitInstance *genkit.Genkit, model ai.Model, generationConfig *genai.GenerateContentConfig, roomLookupRepo RoomLookupRepository, guestLookupRepo GuestLookupRepository, userLookupRepo UserLookupRepository, deptLookupRepo DepartmentLookupRepository) *core.Flow[GenerateRequestInput, EnrichedGenerateRequestOutput, struct{}] {
	generateRequestFlow := genkit.DefineFlow(genkitInstance, "generateRequestFlow",
		func(ctx context.Context, input GenerateRequestInput) (EnrichedGenerateRequestOutput, error) {
			departments, err := deptLookupRepo.GetDepartmentsByHotelID(ctx, input.HotelID)
			if err != nil {
				return EnrichedGenerateRequestOutput{}, fmt.Errorf("fetch departments: %w", err)
			}

			deptNames := make([]string, len(departments))
			for i, d := range departments {
				deptNames[i] = d.Name
			}

			prompt := prompts.GenerateRequestPrompt(input.RawText, deptNames)
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

			output, err = enrichWithUserLookup(ctx, userLookupRepo, input.HotelID, output)
			if err != nil {
				return EnrichedGenerateRequestOutput{}, err
			}

			return enrichWithDepartmentLookup(departments, output), nil
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

func enrichWithDepartmentLookup(departments []*models.Department, output EnrichedGenerateRequestOutput) EnrichedGenerateRequestOutput {
	if output.Department == nil {
		return output
	}
	output.DepartmentID = LookupDepartmentID(departments, *output.Department)
	return output
}
