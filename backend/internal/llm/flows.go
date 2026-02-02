package llm

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

func DefineParseRequest(g *genkit.Genkit, model ai.Model, genConfig *ai.GenerationCommonConfig) *core.Flow[ParseRequestInput, ParseRequestOutput, struct{}] {
	parseRequestFlow := genkit.DefineFlow(g, "parseRequestFlow",
		func(ctx context.Context, input ParseRequestInput) (ParseRequestOutput, error) {
			prompt := fmt.Sprintf(`Generate a request for a hotel guest based on the following description: %s 
			
			Important: 
			- Only include the defined schema fields
			- Only include fields where you have actual information
			`, input.RawText)
			resp, _, err := genkit.GenerateData[ParseRequestOutput](ctx, g, ai.WithPrompt(prompt), ai.WithModel(model), ai.WithConfig(genConfig))
			if err != nil {
				return ParseRequestOutput{}, err
			}

			return *resp, nil
		},
	)

	return parseRequestFlow
}
