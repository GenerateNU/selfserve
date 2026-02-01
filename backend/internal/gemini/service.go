package gemini

import (
	"github.com/firebase/genkit/go/core"
	"github.com/firebase/genkit/go/genkit"
)

type GeminiService struct {
	genkit           *genkit.Genkit
	MakeRequestFromTextFlow *core.Flow[MakeRequestFromTextInput, MakeRequestFromTextOutput, struct{}]
}
