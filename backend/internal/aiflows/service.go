package aiflows

import (
	"context"

	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

// GenerateRequestService defines the interface for generating requests via GenKit.
// Handlers should depend on this interface to allow for mocking in tests.
type GenerateRequestService interface {
	RunGenerateRequest(ctx context.Context, input GenerateRequestInput) (GenerateRequestOutput, error)
}

type GenkitService struct {
	genkit              *genkit.Genkit
	generateRequestFlow *core.Flow[GenerateRequestInput, GenerateRequestOutput, struct{}]
}

func (s *GenkitService) RunGenerateRequest(ctx context.Context, input GenerateRequestInput) (GenerateRequestOutput, error) {
	return s.generateRequestFlow.Run(ctx, input)
}
