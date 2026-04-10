package clerk

import (
	"encoding/json"
	"net/http"
	"github.com/generate/selfserve/internal/models"
)

func FetchUsersFromClerk(clerkApiUrl string, clerkSecret string) ([]models.ClerkUser, error) {
	req, err := http.NewRequest("GET", clerkApiUrl+"?with_organization_memberships=true", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+clerkSecret)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var users []models.ClerkUser
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, err
	}
	return users, nil
}
