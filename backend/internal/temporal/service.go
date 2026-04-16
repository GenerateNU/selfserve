package temporal

import (
	"context"
	"errors"

	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/temporal/workflows"
	"github.com/google/uuid"
	enumspb "go.temporal.io/api/enums/v1"
	"go.temporal.io/api/serviceerror"
	"go.temporal.io/sdk/client"
)

type GenerateRequestResult struct {
	Status string                                 `json:"status"`
	Output *aiflows.EnrichedGenerateRequestOutput `json:"output,omitempty"`
	Error  *string                                `json:"error,omitempty"`
}

type GenerateRequestWorkflowClient interface {
	StartGenerateRequest(ctx context.Context, input aiflows.GenerateRequestInput) (workflowID string, err error)
	GetGenerateRequestResult(ctx context.Context, workflowID string) (GenerateRequestResult, error)
}

type Service struct {
	client client.Client
}

func NewService(c client.Client) *Service {
	return &Service{client: c}
}

func (s *Service) StartGenerateRequest(ctx context.Context, input aiflows.GenerateRequestInput) (string, error) {
	workflowID := "generate-request-" + uuid.NewString()
	_, err := s.client.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:        workflowID,
		TaskQueue: workflows.GenerateRequestTaskQueue,
	}, workflows.GenerateRequestWorkflow, input)
	if err != nil {
		return "", err
	}
	return workflowID, nil
}

func (s *Service) GetGenerateRequestResult(ctx context.Context, workflowID string) (GenerateRequestResult, error) {
	description, err := s.client.DescribeWorkflowExecution(ctx, workflowID, "")
	if err != nil {
		return GenerateRequestResult{}, err
	}

	status := description.WorkflowExecutionInfo.GetStatus()
	switch status {
	case enumspb.WORKFLOW_EXECUTION_STATUS_RUNNING:
		return GenerateRequestResult{Status: "pending"}, nil
	case enumspb.WORKFLOW_EXECUTION_STATUS_COMPLETED:
		var output aiflows.EnrichedGenerateRequestOutput
		getErr := s.client.GetWorkflow(ctx, workflowID, "").Get(ctx, &output)
		if getErr != nil {
			return GenerateRequestResult{}, getErr
		}
		return GenerateRequestResult{Status: "completed", Output: &output}, nil
	case enumspb.WORKFLOW_EXECUTION_STATUS_FAILED, enumspb.WORKFLOW_EXECUTION_STATUS_TERMINATED, enumspb.WORKFLOW_EXECUTION_STATUS_TIMED_OUT:
		var output aiflows.EnrichedGenerateRequestOutput
		getErr := s.client.GetWorkflow(ctx, workflowID, "").Get(ctx, &output)
		msg := "workflow failed"
		if getErr != nil {
			msg = getErr.Error()
		}
		return GenerateRequestResult{Status: "failed", Error: &msg}, nil
	default:
		msg := "workflow status unknown"
		return GenerateRequestResult{Status: "failed", Error: &msg}, nil
	}
}

func IsWorkflowNotFound(err error) bool {
	var notFoundErr *serviceerror.NotFound
	return errors.As(err, &notFoundErr)
}
