package clerk

import (
	"context"

	clerksdk "github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/organization"
)

func CreateClerkOrg(ctx context.Context, name string, createdByUserID string) (string, error) {
	org, err := organization.Create(ctx, &organization.CreateParams{
		Name:      clerksdk.String(name),
		CreatedBy: clerksdk.String(createdByUserID),
	})
	if err != nil {
		return "", err
	}

	return org.ID, nil
}
