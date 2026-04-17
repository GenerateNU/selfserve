package activities

import (
	"context"
	"testing"

	"github.com/generate/selfserve/internal/aiflows"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockGenerateRequestService struct {
	runGenerateRequestFunc func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error)
}

func (m *mockGenerateRequestService) RunGenerateRequest(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
	return m.runGenerateRequestFunc(ctx, input)
}

func TestActivities_RunGenerateRequest(t *testing.T) {
	t.Parallel()

	input := aiflows.GenerateRequestInput{
		RawText: "room 301 needs towels",
		HotelID: "org_1",
	}
	mockService := &mockGenerateRequestService{
		runGenerateRequestFunc: func(ctx context.Context, gotInput aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
			assert.Equal(t, input, gotInput)
			return aiflows.EnrichedGenerateRequestOutput{
				GenerateRequestOutput: aiflows.GenerateRequestOutput{
					Name:        "Towels",
					RequestType: "one-time",
					Status:      "pending",
					Priority:    "medium",
				},
			}, nil
		},
	}

	acts := &Activities{Service: mockService}
	out, err := acts.RunGenerateRequest(context.Background(), input)
	require.NoError(t, err)
	assert.Equal(t, "Towels", out.Name)
	assert.Equal(t, "one-time", out.RequestType)
}
