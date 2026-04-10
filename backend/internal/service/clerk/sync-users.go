package clerk

import (
	"encoding/json"

	"net/http"

	"github.com/generate/selfserve/internal/models"
)

func FetchUsersFromClerk(clerkApiUrl string, clerkSecret string) ([]models.ClerkUser, error) {
	req, err := http.NewRequest("GET", clerkApiUrl+"/users?with_organization_memberships=true&limit=100", nil)
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

func FetchUserOrgID(clerkApiUrl string, clerkSecret string, userID string) (string, error) {
	req, err := http.NewRequest("GET", clerkApiUrl+"/users/"+userID+"/organization_memberships", nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+clerkSecret)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Data []struct {
			Organization struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"organization"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	if len(result.Data) == 0 {
		return "", nil
	}
	return result.Data[0].Organization.ID, nil
}