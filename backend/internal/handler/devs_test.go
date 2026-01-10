package handler

import (
	"context"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHandler_GetDev(t *testing.T) {
	t.Parallel()

	// Load environment variables
	err := godotenv.Load("../../config/.env")
	if err != nil {
		t.Fatalf("failed to load .env: %v", err)
	}

	var cfg config.Config
	ctx := context.Background()
	if err := envconfig.Process(ctx, &cfg); err != nil {
		t.Fatalf("failed to process config: %v", err)
	}

	app := fiber.New()
	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		t.Fatalf("failed to create repository: %v", err)
	}
	h := NewDevsHandler(repository.NewDevsRepository(repo.DB))
	app.Get("/devs/:name", h.GetMember)

	req := httptest.NewRequest("GET", "/devs/Dao", nil)
	resp, err := app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, 200, resp.StatusCode)

	body, _ := io.ReadAll(resp.Body)
	assert.Equal(t, "Yogurt. Gurt: Yo!", string(body))
}
