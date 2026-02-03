package llm

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
	"github.com/generate/selfserve/internal/llm/prompts"
)

func DefineGenerateRequest(genkitInstance *genkit.Genkit, model ai.Model, generationConfig *ai.GenerationCommonConfig) *core.Flow[GenerateRequestInput, GenerateRequestOutput, struct{}] {
	generateRequestFlow := genkit.DefineFlow(genkitInstance, "generateRequestFlow",
		func(ctx context.Context, input GenerateRequestInput) (GenerateRequestOutput, error) {
			prompt := fmt.Sprintf(prompts.GenerateRequestPrompt, input.RawText)
			resp, _, err := genkit.GenerateData[GenerateRequestOutput](ctx, genkitInstance, ai.WithPrompt(prompt), ai.WithModel(model), ai.WithConfig(generationConfig))
			if err != nil {
				return GenerateRequestOutput{}, err
			}

			return *resp, nil
		},
	)

	return generateRequestFlow
}
