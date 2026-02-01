package llm

import (
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

type LLMService struct {
	genkit                  *genkit.Genkit
	MakeRequestFromTextFlow *core.Flow[MakeRequestFromTextInput, MakeRequestFromTextOutput, struct{}]
}
