package workflows

import (
	"time"

	"github.com/generate/selfserve/internal/aiflows"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

const GenerateRequestTaskQueue = "generate-request-queue"
const runGenerateRequestActivityName = "RunGenerateRequest"

func GenerateRequestWorkflow(ctx workflow.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
	activityOptions := workflow.ActivityOptions{
		StartToCloseTimeout: 2 * time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    2 * time.Second,
			BackoffCoefficient: 2.0,
			MaximumAttempts:    3,
		},
	}

	ctx = workflow.WithActivityOptions(ctx, activityOptions)

	var output aiflows.EnrichedGenerateRequestOutput
	err := workflow.ExecuteActivity(ctx, runGenerateRequestActivityName, input).Get(ctx, &output)
	if err != nil {
		return aiflows.EnrichedGenerateRequestOutput{}, err
	}

	return output, nil
}
