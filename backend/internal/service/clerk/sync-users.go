package clerk

import (
	"encoding/json"
	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/models"
	"net/http"
)

func ValidateAndReformatUserData(users []models.ClerkUser) ([]*models.CreateUser, error) {
	var reformatedUsers []*models.CreateUser
	for _, user := range users {
		if err := handler.ValidateCreateUserClerk(&user); err != nil {
			return nil, err
		}
		reformatedUsers = append(reformatedUsers, handler.ReformatUserData(&user))
	}
	return reformatedUsers, nil
}

func FetchUsersFromClerk(clerkApiUrl string, clerkSecret string) ([]models.ClerkUser, error) {
	req, err := http.NewRequest("GET", clerkApiUrl, nil)
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
