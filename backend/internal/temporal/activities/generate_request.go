package activities

import (
	"context"

	"github.com/generate/selfserve/internal/aiflows"
)

type Activities struct {
	Service aiflows.GenerateRequestService
}

func (a *Activities) RunGenerateRequest(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
	return a.Service.RunGenerateRequest(ctx, input)
}
