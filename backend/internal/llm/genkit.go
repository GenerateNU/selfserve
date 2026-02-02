package llm

import (
	"context"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/ollama"
	"github.com/generate/selfserve/config"
)

const defaultOllamaServer = "http://127.0.0.1:11434"

func InitGenkit(ctx context.Context, cfg *config.LLM) *LLMService {
	serverAddr := cfg.ServerAddress
	if serverAddr == "" {
		serverAddr = defaultOllamaServer
	}
	llmProvider := &ollama.Ollama{
		ServerAddress: serverAddr,
		Timeout:       cfg.Timeout,
	}

	g := genkit.Init(ctx, genkit.WithPlugins(llmProvider))

	model := llmProvider.DefineModel(g, ollama.ModelDefinition{
		Name: cfg.Model,
		Type: "generate",
	}, &ai.ModelOptions{
		Supports: &ai.ModelSupports{
			Multiturn:  false,
			SystemRole: false,
			Tools:      false,
			Media:      false,
		},
	})

	genConfig := &ai.GenerationCommonConfig{
		MaxOutputTokens: cfg.MaxOutputTokens,
		Temperature:     cfg.Temperature,
	}
	parseRequestFlow := DefineParseRequest(g, model, genConfig)

	return &LLMService{
		genkit:           g,
		parseRequestFlow: parseRequestFlow,
	}
}
