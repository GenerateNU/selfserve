package workflows

import (
	"context"
	"errors"
	"testing"

	"github.com/generate/selfserve/internal/aiflows"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/testsuite"
)

type workflowTestSuite struct {
	suite.Suite
	testsuite.WorkflowTestSuite
	env *testsuite.TestWorkflowEnvironment
}

func (s *workflowTestSuite) SetupTest() {
	s.env = s.NewTestWorkflowEnvironment()
}

func (s *workflowTestSuite) AfterTest(_, _ string) {
	s.env.AssertExpectations(s.T())
}

func (s *workflowTestSuite) TestSuccess() {
	input := aiflows.GenerateRequestInput{
		RawText: "need towels",
		HotelID: "org_1",
	}
	expected := aiflows.GenerateRequestOutput{
		Name:        "Towels",
		RequestType: "one-time",
		Status:      "pending",
		Priority:    "low",
	}

	s.env.RegisterActivityWithOptions(
		func(ctx context.Context, gotInput aiflows.GenerateRequestInput) (aiflows.GenerateRequestOutput, error) {
			assert.Equal(s.T(), input, gotInput)
			return expected, nil
		},
		activity.RegisterOptions{Name: "RunGenerateRequest"},
	)
	s.env.ExecuteWorkflow(GenerateRequestWorkflow, input)

	require.True(s.T(), s.env.IsWorkflowCompleted())
	require.NoError(s.T(), s.env.GetWorkflowError())

	var output aiflows.GenerateRequestOutput
	require.NoError(s.T(), s.env.GetWorkflowResult(&output))
	assert.Equal(s.T(), expected, output)
}

func (s *workflowTestSuite) TestActivityFailure() {
	input := aiflows.GenerateRequestInput{
		RawText: "need towels",
		HotelID: "org_1",
	}

	s.env.RegisterActivityWithOptions(
		func(ctx context.Context, gotInput aiflows.GenerateRequestInput) (aiflows.GenerateRequestOutput, error) {
			assert.Equal(s.T(), input, gotInput)
			return aiflows.GenerateRequestOutput{}, errors.New("llm unavailable")
		},
		activity.RegisterOptions{Name: "RunGenerateRequest"},
	)
	s.env.ExecuteWorkflow(GenerateRequestWorkflow, input)

	require.True(s.T(), s.env.IsWorkflowCompleted())
	require.Error(s.T(), s.env.GetWorkflowError())
}

func TestGenerateRequestWorkflowSuite(t *testing.T) {
	t.Parallel()
	suite.Run(t, new(workflowTestSuite))
}
