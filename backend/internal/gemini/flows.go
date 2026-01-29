package gemini

import (
	"context"
	"fmt"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

// FlowSet contains all the Genkit flows
type FlowSet struct {
	RequestParseFlow *core.Flow[ParseRequestInput, ParseRequestOutput, struct{}]
}

func initFlowSet(g *genkit.Genkit) *FlowSet {
	// Parse a raw request and interpret it into structured data
	parseRequestFlow := genkit.DefineFlow(g, "parse_request",
		func(ctx context.Context, input ParseRequestInput) (ParseRequestOutput, error) {
			prompt := fmt.Sprintf(`Parse the following request: %s and interpret it into a structured request.`, input.Request)
			resp, _, err := genkit.GenerateData[ParseRequestOutput](ctx, g, ai.WithPrompt(prompt))
			if err != nil {
				return ParseRequestOutput{}, err
			}

			return *resp, nil
		})

	return &FlowSet{
		RequestParseFlow: parseRequestFlow,
	}
}
