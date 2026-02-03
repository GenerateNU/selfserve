package llm

import (
	"context"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/ollama"
	"github.com/generate/selfserve/config"
)

const defaultOllamaServer = "http://127.0.0.1:11434"

func InitGenkit(ctx context.Context, llmConfig *config.LLM) *LLMService {
	serverAddr := llmConfig.ServerAddress
	if serverAddr == "" {
		serverAddr = defaultOllamaServer
	}
	llmProvider := &ollama.Ollama{
		ServerAddress: serverAddr,
		Timeout:       llmConfig.Timeout,
	}

	genkitInstance := genkit.Init(ctx, genkit.WithPlugins(llmProvider))

	model := llmProvider.DefineModel(genkitInstance, ollama.ModelDefinition{
		Name: llmConfig.Model,
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
	generateRequestFlow := DefineGenerateRequest(genkitInstance, model, generationConfig)

	return &LLMService{
		genkit:              genkitInstance,
		generateRequestFlow: generateRequestFlow,
	}
}
