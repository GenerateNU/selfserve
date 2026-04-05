package clerk

import (
	"context"
	"encoding/json"

	clerksdk "github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/organization"
)

func CreateClerkOrg(ctx context.Context, name string, createdByUserID string, hotelID string) (string, error) {
	metadata, err := json.Marshal(map[string]string{
		"hotel_id": hotelID,
	})
	if err != nil {
		return "", err
	}

	raw := json.RawMessage(metadata)
	org, err := organization.Create(ctx, &organization.CreateParams{
		Name:           clerksdk.String(name),
		CreatedBy:      clerksdk.String(createdByUserID),
		PublicMetadata: &raw,
	})
	if err != nil {
		return "", err
	}

	return org.ID, nil
}
