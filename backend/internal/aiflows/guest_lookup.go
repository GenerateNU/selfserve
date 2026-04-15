package aiflows

import (
	"context"
	"fmt"
)

type GuestLookupRepository interface {
	FindGuestByName(ctx context.Context, hotelID, name string) ([]string, error)
}

// LookupGuest returns (guestID, warningMessage, error).
// warningMessage is non-nil when the name matched 0 or >1 guests.
func LookupGuest(ctx context.Context, repo GuestLookupRepository, input GuestLookupInput) (guestID *string, warning *string, err error) {
	ids, err := repo.FindGuestByName(ctx, input.HotelID, input.GuestName)
	if err != nil {
		return nil, nil, err
	}

	switch len(ids) {
	case 1:
		return &ids[0], nil, nil
	case 0:
		msg := fmt.Sprintf("Guest %q could not be found for this hotel.", input.GuestName)
		return nil, &msg, nil
	default:
		msg := fmt.Sprintf("Guest name %q matched multiple guests. Be more specific.", input.GuestName)
		return nil, &msg, nil
	}
}
