package aiflows

import (
	"context"
	"errors"
	"testing"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockRoomLookupRepository struct {
	findRoomByNumberFunc func(ctx context.Context, hotelID string, roomReference string) (*models.Room, error)
}

func (m *mockRoomLookupRepository) FindRoomByNumber(ctx context.Context, hotelID string, roomReference string) (*models.Room, error) {
	return m.findRoomByNumberFunc(ctx, hotelID, roomReference)
}

func TestEnrichWithRoomLookup(t *testing.T) {
	t.Parallel()

	t.Run("sets room_id when room lookup succeeds", func(t *testing.T) {
		t.Parallel()

		roomMentioned := true
		roomReference := "301"
		repo := &mockRoomLookupRepository{
			findRoomByNumberFunc: func(ctx context.Context, hotelID string, roomReference string) (*models.Room, error) {
				require.Equal(t, "550e8400-e29b-41d4-a716-446655440000", hotelID)
				require.Equal(t, "301", roomReference)
				return &models.Room{ID: "room-uuid-301"}, nil
			},
		}

		output, err := enrichWithRoomLookup(context.Background(), repo, "550e8400-e29b-41d4-a716-446655440000", EnrichedGenerateRequestOutput{
			GenerateRequestOutput: GenerateRequestOutput{
			Name:          "Soda Delivery",
			RequestType:   "one-time",
			Status:        "pending",
			Priority:      "medium",
			RoomMentioned: &roomMentioned,
			RoomReference: &roomReference,
		}})

		require.NoError(t, err)
		require.NotNil(t, output.RoomID)
		assert.Equal(t, "room-uuid-301", *output.RoomID)
		assert.Nil(t, output.Warning)
	})

	t.Run("returns room_not_found warning when lookup misses", func(t *testing.T) {
		t.Parallel()

		roomMentioned := true
		roomReference := "999"
		repo := &mockRoomLookupRepository{
			findRoomByNumberFunc: func(ctx context.Context, hotelID string, roomReference string) (*models.Room, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		output, err := enrichWithRoomLookup(context.Background(), repo, "550e8400-e29b-41d4-a716-446655440000", EnrichedGenerateRequestOutput{
			GenerateRequestOutput: GenerateRequestOutput{
			Name:          "Soda Delivery",
			RequestType:   "one-time",
			Status:        "pending",
			Priority:      "medium",
			RoomMentioned: &roomMentioned,
			RoomReference: &roomReference,
		}})

		require.NoError(t, err)
		assert.Nil(t, output.RoomID)
		require.NotNil(t, output.Warning)
		assert.Equal(t, "room_not_found", output.Warning.Code)
		assert.Equal(t, "Room 999 could not be resolved for this hotel.", output.Warning.Message)
	})

	t.Run("returns room_ambiguous warning when lookup is ambiguous", func(t *testing.T) {
		t.Parallel()

		roomMentioned := true
		roomReference := "301"
		repo := &mockRoomLookupRepository{
			findRoomByNumberFunc: func(ctx context.Context, hotelID string, roomReference string) (*models.Room, error) {
				return nil, errs.ErrAlreadyExistsInDB
			},
		}

		output, err := enrichWithRoomLookup(context.Background(), repo, "550e8400-e29b-41d4-a716-446655440000", EnrichedGenerateRequestOutput{
			GenerateRequestOutput: GenerateRequestOutput{
			Name:          "Soda Delivery",
			RequestType:   "one-time",
			Status:        "pending",
			Priority:      "medium",
			RoomMentioned: &roomMentioned,
			RoomReference: &roomReference,
		}})

		require.NoError(t, err)
		assert.Nil(t, output.RoomID)
		require.NotNil(t, output.Warning)
		assert.Equal(t, "room_ambiguous", output.Warning.Code)
		assert.Equal(t, "Room reference was ambiguous. Be more specific.", output.Warning.Message)
	})

	t.Run("skips lookup when no room was mentioned", func(t *testing.T) {
		t.Parallel()

		called := false
		repo := &mockRoomLookupRepository{
			findRoomByNumberFunc: func(ctx context.Context, hotelID string, roomReference string) (*models.Room, error) {
				called = true
				return nil, nil
			},
		}

		output, err := enrichWithRoomLookup(context.Background(), repo, "550e8400-e29b-41d4-a716-446655440000", EnrichedGenerateRequestOutput{
			GenerateRequestOutput: GenerateRequestOutput{
			Name:        "Lobby Cleanup",
			RequestType: "one-time",
			Status:      "pending",
			Priority:    "low",
		}})

		require.NoError(t, err)
		assert.False(t, called)
		assert.Nil(t, output.RoomID)
		assert.Nil(t, output.Warning)
	})

	t.Run("returns hard errors from lookup", func(t *testing.T) {
		t.Parallel()

		roomMentioned := true
		roomReference := "301"
		repo := &mockRoomLookupRepository{
			findRoomByNumberFunc: func(ctx context.Context, hotelID string, roomReference string) (*models.Room, error) {
				return nil, errors.New("db offline")
			},
		}

		_, err := enrichWithRoomLookup(context.Background(), repo, "550e8400-e29b-41d4-a716-446655440000", EnrichedGenerateRequestOutput{
			GenerateRequestOutput: GenerateRequestOutput{
			Name:          "Soda Delivery",
			RequestType:   "one-time",
			Status:        "pending",
			Priority:      "medium",
			RoomMentioned: &roomMentioned,
			RoomReference: &roomReference,
		}})

		require.Error(t, err)
		assert.EqualError(t, err, "db offline")
	})
}
