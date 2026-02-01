package gemini

import (
	"context"

	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/googlegenai"
)

func InitGenkit(ctx context.Context) *GeminiService {
	g := genkit.Init(ctx,
		genkit.WithPlugins(&googlegenai.GoogleAI{}),
		genkit.WithDefaultModel("googleai/gemini-2.5-flash"),
	)

	flows := initFlowSet(g)

	return &GeminiService{
		genkit:                  g,
		MakeRequestFromTextFlow: flows.MakeRequestFromTextFlow,
	}
}
