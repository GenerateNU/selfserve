package temporal

import (
	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/temporal/activities"
	"github.com/generate/selfserve/internal/temporal/workflows"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func NewWorker(c client.Client, genkitSvc aiflows.GenerateRequestService) worker.Worker {
	w := worker.New(c, workflows.GenerateRequestTaskQueue, worker.Options{})
	acts := &activities.Activities{Service: genkitSvc}

	w.RegisterWorkflow(workflows.GenerateRequestWorkflow)
	w.RegisterActivityWithOptions(acts.RunGenerateRequest, activity.RegisterOptions{
		Name: "RunGenerateRequest",
	})

	return w
}
