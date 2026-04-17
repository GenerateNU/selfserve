package aiflows

import (
	"context"
	"fmt"
)

type UserLookupRepository interface {
	FindUserByName(ctx context.Context, hotelID, name string) ([]string, error)
}

// LookupUser returns (userID, warningMessage, error).
// warningMessage is non-nil when the name matched 0 or >1 users.
func LookupUser(ctx context.Context, repo UserLookupRepository, input UserLookupInput) (userID *string, warning *string, err error) {
	ids, err := repo.FindUserByName(ctx, input.HotelID, input.UserName)
	if err != nil {
		return nil, nil, err
	}

	switch len(ids) {
	case 1:
		return &ids[0], nil, nil
	case 0:
		msg := fmt.Sprintf("Staff member %q could not be found for this hotel.", input.UserName)
		return nil, &msg, nil
	default:
		msg := fmt.Sprintf("Staff member name %q matched multiple users. Be more specific.", input.UserName)
		return nil, &msg, nil
	}
}
