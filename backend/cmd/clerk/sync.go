package main

import (
	"context"
	json "encoding/json"
	"fmt"
	"log"
	http "net/http"
	"os"

	"github.com/generate/selfserve/internal/handler"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	pgxpool "github.com/jackc/pgx/v5/pgxpool"
)

var CLERK_API_BASE_URL = "https://api.clerk.com/v1"

func main() {
	ctx := context.Background()
	pool := connectToDB(ctx)
	defer pool.Close()
	usersRepo := repository.NewUsersRepository(pool)
	path := "/users"
	err := syncUsers(ctx, CLERK_API_BASE_URL + path, os.Getenv("DEV_CLERK_SECRET_KEY"), usersRepo)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Sync completed successfully")
}

func syncUsers(ctx context.Context, clerkBaseURL string, clerkSecret string,
	 usersRepo storage.UsersRepository) error {

	users, err := fetchUsersFromClerk(clerkBaseURL, clerkSecret)
	if err != nil {
		return err
	}

	transformed, err := validateAndReformatUserData(users)
	if err != nil {
		return err
	}

	if err := usersRepo.BulkInsertUsers(ctx, transformed); err != nil {
		return fmt.Errorf("failed to insert users: %w", err)
	}

	return nil
}

func validateAndReformatUserData(users []models.ClerkUser) ([]*models.CreateUser, error) {
	var reformatedUsers []*models.CreateUser
	for _, user := range users {
		if err := handler.ValidateCreateUserClerk(&user); err != nil {
			return nil, err
		}
		reformatedUsers = append(reformatedUsers, handler.ReformatUserData(&user))
	}
	return reformatedUsers, nil
}



func fetchUsersFromClerk(clerkApiUrl string, clerkSecret string) ([]models.ClerkUser, error) { 
	req, err := http.NewRequest("GET", clerkApiUrl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+ clerkSecret)
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

func connectToDB(ctx context.Context) *pgxpool.Pool {
    pool, err := pgxpool.New(ctx, connectionString())
    if err != nil {
        log.Fatal("failed to connect to db:", err)
    }
	return pool
}

func connectionString() string {
    sslmode := os.Getenv("DB_SSLMODE")
	// SSL mode that must be used in prod will have to be specified in the .env
    if sslmode == "" {
        sslmode = "disable"
    }

    return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
        os.Getenv("DB_HOST"),
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_NAME"),
        os.Getenv("DB_PORT"),
        sslmode,
    )
}