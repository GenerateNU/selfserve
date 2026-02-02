package llm

import (
	"context"

	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

// LLMServicer defines the interface for LLM operations
// Handlers should depend on this interface so you can mock
type LLMServicer interface {
	RunMakeRequestFromText(ctx context.Context, input MakeRequestFromTextInput) (MakeRequestFromTextOutput, error)
}

type LLMService struct {
	genkit                  *genkit.Genkit
	MakeRequestFromTextFlow *core.Flow[MakeRequestFromTextInput, MakeRequestFromTextOutput, struct{}]
}

func (s *LLMService) RunMakeRequestFromText(ctx context.Context, input MakeRequestFromTextInput) (MakeRequestFromTextOutput, error) {
	return s.MakeRequestFromTextFlow.Run(ctx, input)
}
