package utils

import (
	"context"
	"encoding/json"

	"github.com/clerk/clerk-sdk-go/v2/organization"
)

func UpdateOrgMetadata(ctx context.Context, clerkOrgID string, hotelID string) error {
	metadata, err := json.Marshal(map[string]string{
		"hotel_id": hotelID,
	})
	if err != nil {
		return err
	}

	raw := json.RawMessage(metadata)
	_, err = organization.Update(ctx, clerkOrgID, &organization.UpdateParams{
		PublicMetadata: &raw,
	})
	return err
}
