package llm

import (
	"context"

	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

// RequestParser defines the interface for parsing requests via LLM.
// Handlers should depend on this interface to allow for mocking in tests.
type GenerateRequestService interface {
	RunGenerateRequest(ctx context.Context, input GenerateRequestInput) (GenerateRequestOutput, error)
}

type LLMService struct {
	genkit              *genkit.Genkit
	generateRequestFlow *core.Flow[GenerateRequestInput, GenerateRequestOutput, struct{}]
}

func (s *LLMService) RunGenerateRequest(ctx context.Context, input GenerateRequestInput) (GenerateRequestOutput, error) {
	return s.generateRequestFlow.Run(ctx, input)
}
