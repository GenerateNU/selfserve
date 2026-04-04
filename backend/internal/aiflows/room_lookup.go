package aiflows

import (
	"context"
	"errors"
	"fmt"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
)

type RoomLookupRepository interface {
	FindRoomByNumber(ctx context.Context, hotelID string, roomReference string) (*models.Room, error)
}

func LookupRoom(ctx context.Context, repo RoomLookupRepository, input RoomLookupInput) (RoomLookupResult, error) {
	room, err := repo.FindRoomByNumber(ctx, input.HotelID, input.RoomReference)
	if err != nil {
		if errors.Is(err, errs.ErrAlreadyExistsInDB) {
			message := "Room reference was ambiguous. Be more specific."
			return RoomLookupResult{
				Matched:   false,
				Ambiguous: true,
				Message:   &message,
			}, nil
		}
		if errors.Is(err, errs.ErrNotFoundInDB) {
			message := fmt.Sprintf("Room %s could not be resolved for this hotel.", input.RoomReference)
			return RoomLookupResult{
				Matched:   false,
				Ambiguous: false,
				Message:   &message,
			}, nil
		}
		return RoomLookupResult{}, err
	}

	return RoomLookupResult{
		Matched:   true,
		Ambiguous: false,
		RoomID:    &room.ID,
	}, nil
}
