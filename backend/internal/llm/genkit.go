package llm

import (
	"context"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/ollama"
	"github.com/generate/selfserve/config"
)

func InitGenkit(ctx context.Context, cfg *config.Ollama) *LLMService {
	ollamaPlugin := &ollama.Ollama{
		ServerAddress: cfg.ServerAddress,
		Timeout:       cfg.Timeout,
	}

	g := genkit.Init(ctx, genkit.WithPlugins(ollamaPlugin))

	model := ollamaPlugin.DefineModel(g, ollama.ModelDefinition{
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

	flows := initFlowSet(g, model)

	return &LLMService{
		genkit:                  g,
		MakeRequestFromTextFlow: flows.MakeRequestFromTextFlow,
	}
}
