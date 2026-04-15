package aiflows

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/googlegenai"
	"github.com/generate/selfserve/config"
	"google.golang.org/genai"
)

const defaultGeminiModel = "gemini-3-flash-preview"

func InitGenkit(ctx context.Context, llmConfig *config.LLM, roomLookupRepo RoomLookupRepository, guestLookupRepo GuestLookupRepository, userLookupRepo UserLookupRepository) *GenkitService {
	serverAddr := llmConfig.ServerAddress
	if serverAddr == "" {
		serverAddr = defaultOllamaServer
	}
	modelName := llmConfig.Model
	if modelName == "" {
		modelName = defaultGeminiModel
	}

	llmProvider := &googlegenai.GoogleAI{
		APIKey: llmConfig.APIKey,
	}

	genkitInstance := genkit.Init(ctx, genkit.WithPlugins(llmProvider))

	// gemini-3-flash-preview is not yet in the plugin's known-models list,
	// so pass explicit capabilities to avoid "unknown model" error.
	model, err := llmProvider.DefineModel(genkitInstance, modelName, &ai.ModelOptions{
		Supports: &ai.ModelSupports{
			Multiturn:   true,
			Tools:       true,
			ToolChoice:  true,
			SystemRole:  true,
			Media:       true,
			Constrained: ai.ConstrainedSupportNoTools,
		},
	})
	if err != nil {
		panic(fmt.Errorf("InitGenkit: define model %q: %w", modelName, err))
	}

	generationConfig := &genai.GenerateContentConfig{
		MaxOutputTokens: int32(llmConfig.MaxOutputTokens),
	}

	generateRequestFlow := DefineGenerateRequest(genkitInstance, model, generationConfig, roomLookupRepo, guestLookupRepo, userLookupRepo)

	return &GenkitService{
		genkit:              genkitInstance,
		generateRequestFlow: generateRequestFlow,
	}
}
