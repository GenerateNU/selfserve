package aiflows

import (
	"context"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/ollama"
	"github.com/generate/selfserve/config"
)

const defaultOllamaServer = "http://127.0.0.1:11434"
const defaultOllamaModel = "reaperdoesntrun/Qwen3-0.6B-Distilled:latest"

func InitGenkit(ctx context.Context, llmConfig *config.LLM, roomLookupRepo RoomLookupRepository, guestLookupRepo GuestLookupRepository) *GenkitService {
	serverAddr := llmConfig.ServerAddress
	if serverAddr == "" {
		serverAddr = defaultOllamaServer
	}
	modelName := llmConfig.Model
	if modelName == "" {
		modelName = defaultOllamaModel
	}
	llmProvider := &ollama.Ollama{
		ServerAddress: serverAddr,
		Timeout:       llmConfig.Timeout,
	}

	genkitInstance := genkit.Init(ctx, genkit.WithPlugins(llmProvider))

	model := llmProvider.DefineModel(genkitInstance, ollama.ModelDefinition{
		Name: modelName,
		Type: "generate",
	}, &ai.ModelOptions{
		Supports: &ai.ModelSupports{
			Multiturn:  false,
			SystemRole: false,
			Tools:      false,
			Media:      false,
		},
	})

	generationConfig := &ai.GenerationCommonConfig{
		MaxOutputTokens: llmConfig.MaxOutputTokens,
		Temperature:     llmConfig.Temperature,
	}
	generateRequestFlow := DefineGenerateRequest(genkitInstance, model, generationConfig, roomLookupRepo, guestLookupRepo)

	return &GenkitService{
		genkit:              genkitInstance,
		generateRequestFlow: generateRequestFlow,
	}
}
