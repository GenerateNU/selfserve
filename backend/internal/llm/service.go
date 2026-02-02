package llm

import (
	"context"

	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

// LLMServicer defines the interface for LLM operations.
// Handlers should depend on this interface to allow for mocking in tests.
type LLMServicer interface {
	RunParseRequest(ctx context.Context, input ParseRequestInput) (ParseRequestOutput, error)
}

type LLMService struct {
	genkit           *genkit.Genkit
	parseRequestFlow *core.Flow[ParseRequestInput, ParseRequestOutput, struct{}]
}

func (s *LLMService) RunParseRequest(ctx context.Context, input ParseRequestInput) (ParseRequestOutput, error) {
	return s.parseRequestFlow.Run(ctx, input)
}
