package handler

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/generate/selfserve/internal/aiflows"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockRequestRepository struct {
	makeRequestFunc                    func(ctx context.Context, req *models.Request) (*models.Request, error)
	updateRequestFunc                  func(ctx context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error)
	findRequestFunc                    func(ctx context.Context, id string) (*models.Request, error)
	findRequestsFunc                   func(ctx context.Context) ([]models.Request, error)
	findRequestsByGuestIDFunc          func(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error)
	findRequestsByRoomIDAndUserIDFunc  func(ctx context.Context, roomID, hotelID, userID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error)
	findUnassignedRequestsByRoomIDFunc func(ctx context.Context, roomID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error)
	findRequestsPaginatedFunc          func(ctx context.Context, hotelID, userID string, unassigned bool, status string, priorities []string, departments []string, floors []int, sort models.RequestFeedSort, cursorID string, cursorCreatedAt time.Time, cursorPriorityRank int, limit int) ([]*models.GuestRequest, error)
}

func (m *mockRequestRepository) InsertRequest(ctx context.Context, req *models.Request) (*models.Request, error) {
	return m.makeRequestFunc(ctx, req)
}

func (m *mockRequestRepository) UpdateRequest(ctx context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
	return m.updateRequestFunc(ctx, id, update)
}

func (m *mockRequestRepository) FindRequest(ctx context.Context, id string) (*models.Request, error) {
	return m.findRequestFunc(ctx, id)
}

func (m *mockRequestRepository) FindRequests(ctx context.Context) ([]models.Request, error) {
	return m.findRequestsFunc(ctx)
}

func (m *mockRequestRepository) FindRequestsByGuestID(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	return m.findRequestsByGuestIDFunc(ctx, guestID, hotelID, cursorID, cursorVersion, limit)
}

func (m *mockRequestRepository) FindRequestsByRoomIDAndUserID(ctx context.Context, roomID, hotelID, userID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	return m.findRequestsByRoomIDAndUserIDFunc(ctx, roomID, hotelID, userID, cursorID, cursorVersion, limit)
}

func (m *mockRequestRepository) FindUnassignedRequestsByRoomIDAndUserID(ctx context.Context, roomID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
	return m.findUnassignedRequestsByRoomIDFunc(ctx, roomID, hotelID, cursorID, cursorVersion, limit)
}

func (m *mockRequestRepository) FindRequestsPaginated(ctx context.Context, hotelID, userID string, unassigned bool, status string, priorities []string, departments []string, floors []int, sort models.RequestFeedSort, cursorID string, cursorCreatedAt time.Time, cursorPriorityRank int, limit int) ([]*models.GuestRequest, error) {
	return m.findRequestsPaginatedFunc(ctx, hotelID, userID, unassigned, status, priorities, departments, floors, sort, cursorID, cursorCreatedAt, cursorPriorityRank, limit)
}

type mockLLMService struct {
	runGenerateRequestFunc func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error)
}

func (m *mockLLMService) RunGenerateRequest(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
	return m.runGenerateRequestFunc(ctx, input)
}

func TestRequestHandler_GetRequest(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 with member", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestFunc: func(ctx context.Context, name string) (*models.Request, error) {
				return &models.Request{
					ID:             "530e8400-e458-41d4-a716-446655440000",
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     "org_521e8400-e458-41d4-a716-446655440000",
						Name:        "room cleaning",
						RequestType: "recurring",
						Status:      "assigned",
						Priority:    "urgent",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/530e8400-e458-41d4-a716-446655440000", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "530e8400-e458-41d4-a716-446655440000")
	})

	t.Run("returns 400 when invalid request body", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, errors.New("error")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/notaUUID", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 404 when not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/530e8400-e458-41d4-a716-446655440001", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/530e8400-e458-41d4-a716-446655440001", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 500 when route is not found/empty", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestRequestHandler_GetRequests(t *testing.T) {
	t.Parallel()

	t.Run("returns 200 two members", func(t *testing.T) {
		t.Parallel()
		mock := &mockRequestRepository{
			findRequestsFunc: func(ctx context.Context) ([]models.Request, error) {
				requests := []models.Request{
					{
						ID:             "530e8400-e458-41d4-a716-446655440000",
						CreatedAt:      time.Now(),
						RequestVersion: time.Now(),
						MakeRequest: models.MakeRequest{
							HotelID:     "org_521e8400-e458-41d4-a716-446655440000",
							Name:        "room cleaning",
							RequestType: "recurring",
							Status:      "assigned",
							Priority:    "urgent",
						},
					},
					{
						ID:             "530e8400-e458-41d4-a716-446655440001",
						CreatedAt:      time.Now(),
						RequestVersion: time.Now(),
						MakeRequest: models.MakeRequest{
							HotelID:     "org_521e8400-e458-41d4-a716-446655440000",
							Name:        "towel replacement",
							RequestType: "one-time",
							Status:      "pending",
							Priority:    "medium",
						},
					},
					{
						ID:             "530e8400-e458-41d4-a716-446655440002",
						CreatedAt:      time.Now(),
						RequestVersion: time.Now(),
						MakeRequest: models.MakeRequest{
							HotelID:     "org_521e8400-e458-41d4-a716-446655440000",
							Name:        "maintenance repair",
							RequestType: "one-time",
							Status:      "in-progress",
							Priority:    "urgent",
						},
					},
					{
						ID:             "530e8400-e458-41d4-a716-446655440003",
						CreatedAt:      time.Now(),
						RequestVersion: time.Now(),
						MakeRequest: models.MakeRequest{
							HotelID:     "org_521e8400-e458-41d4-a716-446655440000",
							Name:        "extra pillows",
							RequestType: "one-time",
							Status:      "completed",
							Priority:    "low",
						},
					},
					{
						ID:             "530e8400-e458-41d4-a716-446655440004",
						CreatedAt:      time.Now(),
						RequestVersion: time.Now(),
						MakeRequest: models.MakeRequest{
							HotelID:     "org_521e8400-e458-41d4-a716-446655440000",
							Name:        "minibar refill",
							RequestType: "recurring",
							Status:      "assigned",
							Priority:    "medium",
						},
					},
				}
				return requests, nil
			},
		}
		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/", h.GetRequests)

		req := httptest.NewRequest("GET", "/request/", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsFunc: func(ctx context.Context) ([]models.Request, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request", h.GetRequests)

		req := httptest.NewRequest("GET", "/request", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 500 when route is not found/empty", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestFunc: func(ctx context.Context, id string) (*models.Request, error) {
				return nil, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/:id", h.GetRequest)

		req := httptest.NewRequest("GET", "/request/", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestRequestHandler_MakeRequest(t *testing.T) {
	t.Parallel()
	validBody := `{
		"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000",
		"name": "room cleaning",
		"request_type": "recurring",
		"status": "pending",
		"priority": "high",
		"notes": "No special requests"
	}`

	t.Run("returns 200 on success", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				req.ID = "generated-uuid"
				return req, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "generated-uuid")
		assert.Contains(t, string(body), "room cleaning")

	})

	t.Run("returns 200 when optional uuid fields are valid", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				req.ID = "generated-uuid"
				return req, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		bodyWithOptionalUUIDs := `{
			"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000",
			"guest_id": "660e8400-e29b-41d4-a716-446655440000",
			"user_id": "770e8400-e29b-41d4-a716-446655440000",
			"name": "room cleaning",
			"request_type": "recurring",
			"status": "pending",
			"priority": "high",
			"notes": "No special requests"
		}`

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(bodyWithOptionalUUIDs))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "660e8400-e29b-41d4-a716-446655440000")
		assert.Contains(t, string(body), "770e8400-e29b-41d4-a716-446655440000")
	})

	t.Run("accepts in progress status from the request status enum", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				req.ID = "generated-uuid"
				return req, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		bodyWithInProgressStatus := `{
			"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000",
			"name": "room cleaning",
			"request_type": "recurring",
			"status": "in progress",
			"priority": "medium",
			"notes": "No special requests"
		}`

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(bodyWithInProgressStatus))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(`{invalid json`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on missing required fields", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "hotel_id")
		assert.Contains(t, string(body), "name")
	})

	t.Run("returns 400 on invalid optional guest_id uuid", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		invalidGuestIDBody := `{
			"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000",
			"guest_id": "not-a-uuid",
			"name": "room cleaning",
			"request_type": "recurring",
			"status": "pending",
			"priority": "high",
			"notes": "No special requests"
		}`

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(invalidGuestIDBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "guest_id")
	})

	t.Run("returns 400 on invalid priority enum", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return req, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		bodyWithInvalidPriority := `{
			"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000",
			"name": "room cleaning",
			"request_type": "recurring",
			"status": "pending",
			"priority": "urgent",
			"notes": "No special requests"
		}`

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(bodyWithInvalidPriority))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "priority")
		assert.Contains(t, string(body), "low, medium, high")
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			makeRequestFunc: func(ctx context.Context, req *models.Request) (*models.Request, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request", h.CreateRequest)

		req := httptest.NewRequest("POST", "/request", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestRequestHandler_Generate_Request(t *testing.T) {
	t.Parallel()

	validBody := `{
		"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000",
		"raw_text": "Room 302 needs extra towels urgently"
	}`

	t.Run("returns 200 on success", func(t *testing.T) {
		t.Parallel()

		description := "Guest requested extra towels for their room"

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				return aiflows.EnrichedGenerateRequestOutput{
					GenerateRequestOutput: aiflows.GenerateRequestOutput{
						Name:        "Extra Towels Request",
						Description: &description,
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "high",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(&mockRequestRepository{}, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"request"`)
		assert.Contains(t, string(body), "Extra Towels Request")
		assert.Contains(t, string(body), "high")
	})

	t.Run("returns 200 with all LLM parsed fields", func(t *testing.T) {
		t.Parallel()

		description := "Full room cleaning requested"
		departmentID := "550e8400-e29b-41d4-a716-446655440001"
		category := "Cleaning"
		notes := "Guest prefers eco-friendly products"
		estimatedTime := 30

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				return aiflows.EnrichedGenerateRequestOutput{
					DepartmentID: &departmentID,
					GenerateRequestOutput: aiflows.GenerateRequestOutput{
						Name:                    "Room Cleaning",
						Description:             &description,
						RequestCategory:         &category,
						RequestType:             "one-time",
						Status:                  "pending",
						Priority:                "medium",
						EstimatedCompletionTime: &estimatedTime,
						Notes:                   &notes,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(&mockRequestRepository{}, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"request"`)
		assert.Contains(t, string(body), "Room Cleaning")
		assert.Contains(t, string(body), departmentID)
		assert.Contains(t, string(body), "Cleaning")
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, &mockLLMService{}, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(`{invalid json`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on missing hotel_id", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, &mockLLMService{}, nil)
		app.Post("/request/generate", h.GenerateRequest)

		bodyMissingHotelID := `{"raw_text": "Need towels"}`
		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(bodyMissingHotelID))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "hotel_id")
	})

	t.Run("returns 400 on empty raw_text", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, &mockLLMService{}, nil)
		app.Post("/request/generate", h.GenerateRequest)

		bodyEmptyText := `{"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000", "raw_text": ""}`
		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(bodyEmptyText))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "raw_text")
	})

	t.Run("returns 500 on LLM error", func(t *testing.T) {
		t.Parallel()

		repoMock := &mockRequestRepository{}

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				return aiflows.EnrichedGenerateRequestOutput{}, errors.New("LLM service unavailable")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(repoMock, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 500 when LLM output fails validation", func(t *testing.T) {
		t.Parallel()

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				return aiflows.EnrichedGenerateRequestOutput{
					GenerateRequestOutput: aiflows.GenerateRequestOutput{
						Name:        "Towel Request",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "urgent",
					},
				}, nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("passes raw_text to LLM correctly", func(t *testing.T) {
		t.Parallel()

		var capturedInput aiflows.GenerateRequestInput

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				capturedInput = input
				return aiflows.EnrichedGenerateRequestOutput{
					GenerateRequestOutput: aiflows.GenerateRequestOutput{
						Name:        "Test Request",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "medium",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(&mockRequestRepository{}, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		customBody := `{
			"hotel_id": "org_550e8400-e29b-41d4-a716-446655440000",
			"raw_text": "I need the AC fixed in room 101 ASAP"
		}`
		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(customBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		assert.Equal(t, "I need the AC fixed in room 101 ASAP", capturedInput.RawText)
		assert.Equal(t, "org_550e8400-e29b-41d4-a716-446655440000", capturedInput.HotelID)
	})

	t.Run("uses hotel_id from request body not LLM", func(t *testing.T) {
		t.Parallel()

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				return aiflows.EnrichedGenerateRequestOutput{
					GenerateRequestOutput: aiflows.GenerateRequestOutput{
						Name:        "Test Request",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "medium",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(&mockRequestRepository{}, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "org_550e8400-e29b-41d4-a716-446655440000")
	})

	t.Run("defaults notes to empty string when LLM omits notes", func(t *testing.T) {
		t.Parallel()

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				return aiflows.EnrichedGenerateRequestOutput{
					GenerateRequestOutput: aiflows.GenerateRequestOutput{
						Name:        "Test Request",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "medium",
						Notes:       nil,
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(&mockRequestRepository{}, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"notes":""`)
	})

	t.Run("returns warning metadata when room lookup warning exists", func(t *testing.T) {
		t.Parallel()

		warningMessage := "Room 301 could not be resolved for this hotel."

		llmMock := &mockLLMService{
			runGenerateRequestFunc: func(ctx context.Context, input aiflows.GenerateRequestInput) (aiflows.EnrichedGenerateRequestOutput, error) {
				return aiflows.EnrichedGenerateRequestOutput{
					GenerateRequestOutput: aiflows.GenerateRequestOutput{
						Name:        "Soda Delivery",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "medium",
						Warning: &aiflows.GenerateRequestWarning{
							Code:    "room_not_found",
							Message: warningMessage,
						},
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(&mockRequestRepository{}, llmMock, nil)
		app.Post("/request/generate", h.GenerateRequest)

		req := httptest.NewRequest("POST", "/request/generate", bytes.NewBufferString(validBody))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"warning"`)
		assert.Contains(t, string(body), `"room_not_found"`)
		assert.Contains(t, string(body), warningMessage)
	})

}

func TestRequestHandler_GetRequestsByGuest(t *testing.T) {
	t.Parallel()

	validGuestID := "530e8400-e458-41d4-a716-446655440000"
	validHotelID := "org_521e8400-e458-41d4-a716-446655440000"

	t.Run("returns 200 with guest requests", func(t *testing.T) {
		t.Parallel()

		description := "This is a very urgent request"
		mock := &mockRequestRepository{
			findRequestsByGuestIDFunc: func(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{
					{
						ID:             "630e8400-e458-41d4-a716-446655440000",
						Name:           "HELP HELP HELP",
						Priority:       "high",
						Status:         "pending",
						Description:    &description,
						RequestType:    "one-time",
						CreatedAt:      time.Now(),
						RequestVersion: time.Now(),
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/guest/:id", h.GetRequestsByGuest)

		req := httptest.NewRequest("GET", "/request/guest/"+validGuestID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "HELP HELP HELP")
		assert.Contains(t, string(body), "high")
		assert.Contains(t, string(body), "630e8400-e458-41d4-a716-446655440000")
	})

	t.Run("returns 200 with empty list when no requests", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByGuestIDFunc: func(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/guest/:id", h.GetRequestsByGuest)

		req := httptest.NewRequest("GET", "/request/guest/"+validGuestID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "[]")
	})

	t.Run("passes correct guest_id and hotel_id to repository", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByGuestIDFunc: func(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
				assert.Equal(t, validGuestID, guestID)
				assert.Equal(t, validHotelID, hotelID)
				return []*models.GuestRequest{}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/guest/:id", h.GetRequestsByGuest)

		req := httptest.NewRequest("GET", "/request/guest/"+validGuestID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 400 when guest_id is invalid UUID", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/guest/:id", h.GetRequestsByGuest)

		req := httptest.NewRequest("GET", "/request/guest/not-a-uuid", nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "guest_id")
	})

	t.Run("returns 400 when X-Hotel-ID header is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/guest/:id", h.GetRequestsByGuest)

		req := httptest.NewRequest("GET", "/request/guest/"+validGuestID, nil)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "hotel_id")
	})

	t.Run("returns 500 on repository error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByGuestIDFunc: func(ctx context.Context, guestID, hotelID, cursorID string, cursorVersion time.Time, limit int) ([]*models.GuestRequest, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/guest/:id", h.GetRequestsByGuest)

		req := httptest.NewRequest("GET", "/request/guest/"+validGuestID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestRequestHandler_UpdateRequest(t *testing.T) {
	t.Parallel()

	const validID = "530e8400-e458-41d4-a716-446655440000"

	t.Run("returns 200 when body is empty object (no fields to update)", func(t *testing.T) {
		t.Parallel()

		var gotUpdate *models.RequestUpdateInput
		mock := &mockRequestRepository{
			updateRequestFunc: func(_ context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
				gotUpdate = update
				return &models.Request{
					ID:             id,
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     "521e8400-e458-41d4-a716-446655440000",
						Name:        "room cleaning",
						RequestType: "recurring",
						Status:      "pending",
						Priority:    "high",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		require.NotNil(t, gotUpdate)
		assert.Nil(t, gotUpdate.UserID)
		assert.Nil(t, gotUpdate.GuestID)
		assert.Nil(t, gotUpdate.ReservationID)
		assert.Nil(t, gotUpdate.Name)
		assert.Nil(t, gotUpdate.Description)
		assert.Nil(t, gotUpdate.RoomID)
		assert.Nil(t, gotUpdate.RequestCategory)
		assert.Nil(t, gotUpdate.RequestType)
		assert.Nil(t, gotUpdate.Department)
		assert.Nil(t, gotUpdate.Status)
		assert.Nil(t, gotUpdate.Priority)
		assert.Nil(t, gotUpdate.EstimatedCompletionTime)
		assert.Nil(t, gotUpdate.ScheduledTime)
		assert.Nil(t, gotUpdate.CompletedAt)
		assert.Nil(t, gotUpdate.Notes)
	})

	t.Run("returns 200 and updated request on success", func(t *testing.T) {
		t.Parallel()

		updated := "completed"
		var gotUpdate *models.RequestUpdateInput
		mock := &mockRequestRepository{
			updateRequestFunc: func(_ context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
				gotUpdate = update
				return &models.Request{
					ID:             id,
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     "521e8400-e458-41d4-a716-446655440000",
						Name:        "room cleaning",
						RequestType: "recurring",
						Status:      updated,
						Priority:    "high",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		body := `{"status": "` + updated + `"}`
		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)

		assert.Equal(t, 200, resp.StatusCode)

		b, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(b), validID)
		require.NotNil(t, gotUpdate)
		require.NotNil(t, gotUpdate.Status)
		assert.Equal(t, updated, *gotUpdate.Status)
	})

	t.Run("passes only provided fields to update", func(t *testing.T) {
		t.Parallel()

		var gotUpdate *models.RequestUpdateInput

		mock := &mockRequestRepository{
			updateRequestFunc: func(_ context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
				gotUpdate = update
				return &models.Request{
					ID:             id,
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     "521e8400-e458-41d4-a716-446655440000",
						Name:        "new name",
						Status:      "pending",
						Priority:    "low",
						RequestType: "one-time",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"name": "new name"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		require.NotNil(t, gotUpdate)
		require.NotNil(t, gotUpdate.Name)
		assert.Equal(t, "new name", *gotUpdate.Name)
		assert.Nil(t, gotUpdate.Status)
		assert.Nil(t, gotUpdate.Priority)
	})

	t.Run("returns 400 when id is not a valid UUID", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/not-a-uuid", bytes.NewBufferString(`{"status": "pending"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid JSON", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{invalid`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 on invalid status enum", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"status": "invalid-status"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		b, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(b), "status")
	})

	t.Run("accepts in progress status enum", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			updateRequestFunc: func(_ context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
				require.NotNil(t, update.Status)
				require.Equal(t, "in progress", *update.Status)
				return &models.Request{
					ID:             id,
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     "521e8400-e458-41d4-a716-446655440000",
						Name:        "room cleaning",
						RequestType: "recurring",
						Status:      "in progress",
						Priority:    "high",
					},
				}, nil
			},
		}

		app := fiber.New()
		h := NewRequestsHandler(mock, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"status":"in progress"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 400 on invalid priority enum", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"priority": "urgent"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		b, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(b), "priority")
	})

	t.Run("returns 400 when name is blank", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"name": "   "}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		b, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(b), "name")
	})

	t.Run("returns 400 when request_type is blank", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"request_type":"   "}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		b, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(b), "request_type")
	})

	t.Run("returns 404 when request not found", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			updateRequestFunc: func(_ context.Context, _ string, _ *models.RequestUpdateInput) (*models.Request, error) {
				return nil, errs.ErrNotFoundInDB
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"status": "pending"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("returns 500 on db error", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			updateRequestFunc: func(_ context.Context, _ string, _ *models.RequestUpdateInput) (*models.Request, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Put("/request/:id", h.UpdateRequest)

		req := httptest.NewRequest("PUT", "/request/"+validID, bytes.NewBufferString(`{"status": "pending"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}

func TestRequestHandler_AssignRequest(t *testing.T) {
	t.Parallel()

	const (
		validRequestID = "530e8400-e458-41d4-a716-446655440000"
		validHotelID   = "org_521e8400-e458-41d4-a716-446655440000"
		otherHotelID   = "org_621e8400-e458-41d4-a716-446655440000"
		callerID       = "user_caller"
		otherUserID    = "user_other"
	)

	withAuth := func(app *fiber.App, userID string) {
		app.Use(func(c *fiber.Ctx) error {
			c.Locals("userId", userID)
			return c.Next()
		})
	}

	baseRequest := func() *models.Request {
		return &models.Request{
			ID:             validRequestID,
			CreatedAt:      time.Now(),
			RequestVersion: time.Now(),
			MakeRequest: models.MakeRequest{
				HotelID:     validHotelID,
				Name:        "room cleaning",
				RequestType: "one-time",
				Status:      "pending",
				Priority:    "high",
			},
		}
	}

	t.Run("returns 401 without authenticated user", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 400 when X-Hotel-ID header is missing", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 404 when request hotel does not match X-Hotel-ID", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestFunc: func(_ context.Context, id string) (*models.Request, error) {
				assert.Equal(t, validRequestID, id)
				return baseRequest(), nil
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		body := `{"user_id": "` + otherUserID + `"}`
		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", otherHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 404, resp.StatusCode)
	})

	t.Run("assigns to caller when assign_to_self is true", func(t *testing.T) {
		t.Parallel()

		var gotUpdate *models.RequestUpdateInput
		mock := &mockRequestRepository{
			findRequestFunc: func(_ context.Context, id string) (*models.Request, error) {
				return baseRequest(), nil
			},
			updateRequestFunc: func(_ context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
				gotUpdate = update
				return &models.Request{
					ID:             id,
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     validHotelID,
						UserID:      update.UserID,
						Name:        "room cleaning",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "high",
					},
				}, nil
			},
		}

		app := fiber.New()
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(`{"assign_to_self": true}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		require.NotNil(t, gotUpdate)
		require.NotNil(t, gotUpdate.UserID)
		assert.Equal(t, callerID, *gotUpdate.UserID)
	})

	t.Run("assigns to body user_id when assign_to_self is false", func(t *testing.T) {
		t.Parallel()

		var gotUpdate *models.RequestUpdateInput
		mock := &mockRequestRepository{
			findRequestFunc: func(_ context.Context, id string) (*models.Request, error) {
				return baseRequest(), nil
			},
			updateRequestFunc: func(_ context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
				gotUpdate = update
				return &models.Request{
					ID:             id,
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     validHotelID,
						UserID:      update.UserID,
						Name:        "room cleaning",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "high",
					},
				}, nil
			},
		}

		app := fiber.New()
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		body := `{"assign_to_self": false, "user_id": "` + otherUserID + `"}`
		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		require.NotNil(t, gotUpdate)
		require.NotNil(t, gotUpdate.UserID)
		assert.Equal(t, otherUserID, *gotUpdate.UserID)
	})

	t.Run("assigns to body user_id when assign_to_self is omitted", func(t *testing.T) {
		t.Parallel()

		var gotUpdate *models.RequestUpdateInput
		mock := &mockRequestRepository{
			findRequestFunc: func(_ context.Context, id string) (*models.Request, error) {
				return baseRequest(), nil
			},
			updateRequestFunc: func(_ context.Context, id string, update *models.RequestUpdateInput) (*models.Request, error) {
				gotUpdate = update
				return &models.Request{
					ID:             id,
					CreatedAt:      time.Now(),
					RequestVersion: time.Now(),
					MakeRequest: models.MakeRequest{
						HotelID:     validHotelID,
						UserID:      update.UserID,
						Name:        "room cleaning",
						RequestType: "one-time",
						Status:      "pending",
						Priority:    "high",
					},
				}, nil
			},
		}

		app := fiber.New()
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		body := `{"user_id": "` + otherUserID + `"}`
		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		require.NotNil(t, gotUpdate)
		require.NotNil(t, gotUpdate.UserID)
		assert.Equal(t, otherUserID, *gotUpdate.UserID)
	})

	t.Run("returns 400 when assign_to_self is omitted and user_id is not provided", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when assign_to_self is false and user_id is not provided", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(`{"assign_to_self": false}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})

	t.Run("returns 400 when user_id is explicitly empty", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{}
		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, callerID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Post("/request/:id/assign", h.AssignRequest)

		req := httptest.NewRequest("POST", "/request/"+validRequestID+"/assign", bytes.NewBufferString(`{"user_id":""}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Hotel-ID", validHotelID)
		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)
	})
}

func TestRequestHandler_GetRequestsByRoomID(t *testing.T) {
	t.Parallel()

	const (
		validRoomID  = "630e8400-e458-41d4-a716-446655440000"
		validHotelID = "org_521e8400-e458-41d4-a716-446655440000"
		validUserID  = "user_abc123"
	)

	// withAuth injects a userId local so the handler passes the auth check.
	withAuth := func(app *fiber.App, userID string) {
		app.Use(func(c *fiber.Ctx) error {
			c.Locals("userId", userID)
			return c.Next()
		})
	}

	t.Run("returns 200 with mine and unassigned lists", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByRoomIDAndUserIDFunc: func(_ context.Context, _, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{
					{ID: "aaa00000-e458-41d4-a716-446655440000", Name: "Fix AC", Priority: "high", Status: "assigned", RequestType: "one-time", CreatedAt: time.Now(), RequestVersion: time.Now()},
				}, nil
			},
			findUnassignedRequestsByRoomIDFunc: func(_ context.Context, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{
					{ID: "bbb00000-e458-41d4-a716-446655440000", Name: "Extra towels", Priority: "low", Status: "pending", RequestType: "one-time", CreatedAt: time.Now(), RequestVersion: time.Now()},
				}, nil
			},
		}

		app := fiber.New()
		withAuth(app, validUserID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"assigned"`)
		assert.Contains(t, string(body), `"unassigned"`)
		assert.Contains(t, string(body), "Fix AC")
		assert.Contains(t, string(body), "Extra towels")
	})

	t.Run("returns 200 with empty lists when no requests exist", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByRoomIDAndUserIDFunc: func(_ context.Context, _, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{}, nil
			},
			findUnassignedRequestsByRoomIDFunc: func(_ context.Context, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{}, nil
			},
		}

		app := fiber.New()
		withAuth(app, validUserID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), `"assigned":[]`)
		assert.Contains(t, string(body), `"unassigned":[]`)
	})

	t.Run("passes correct room_id, hotel_id, and user_id to mine query", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByRoomIDAndUserIDFunc: func(_ context.Context, roomID, hotelID, userID, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				assert.Equal(t, validRoomID, roomID)
				assert.Equal(t, validHotelID, hotelID)
				assert.Equal(t, validUserID, userID)
				return []*models.GuestRequest{}, nil
			},
			findUnassignedRequestsByRoomIDFunc: func(_ context.Context, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{}, nil
			},
		}

		app := fiber.New()
		withAuth(app, validUserID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("passes correct room_id and hotel_id to unassigned query", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByRoomIDAndUserIDFunc: func(_ context.Context, _, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{}, nil
			},
			findUnassignedRequestsByRoomIDFunc: func(_ context.Context, roomID, hotelID, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				assert.Equal(t, validRoomID, roomID)
				assert.Equal(t, validHotelID, hotelID)
				return []*models.GuestRequest{}, nil
			},
		}

		app := fiber.New()
		withAuth(app, validUserID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	})

	t.Run("returns 401 when user is not authenticated", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("returns 400 when room_id is not a valid UUID", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, validUserID)
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/not-a-uuid", nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "room_id")
	})

	t.Run("returns 400 when X-Hotel-ID header is missing", func(t *testing.T) {
		t.Parallel()

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, validUserID)
		h := NewRequestsHandler(&mockRequestRepository{}, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 400, resp.StatusCode)

		body, _ := io.ReadAll(resp.Body)
		assert.Contains(t, string(body), "hotel_id")
	})

	t.Run("returns 500 when mine query fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByRoomIDAndUserIDFunc: func(_ context.Context, _, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, validUserID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})

	t.Run("returns 500 when unassigned query fails", func(t *testing.T) {
		t.Parallel()

		mock := &mockRequestRepository{
			findRequestsByRoomIDAndUserIDFunc: func(_ context.Context, _, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return []*models.GuestRequest{}, nil
			},
			findUnassignedRequestsByRoomIDFunc: func(_ context.Context, _, _, _ string, _ time.Time, _ int) ([]*models.GuestRequest, error) {
				return nil, errors.New("db connection failed")
			},
		}

		app := fiber.New(fiber.Config{ErrorHandler: errs.ErrorHandler})
		withAuth(app, validUserID)
		h := NewRequestsHandler(mock, nil, nil)
		app.Get("/request/room/:id", h.GetRequestsByRoomID)

		req := httptest.NewRequest("GET", "/request/room/"+validRoomID, nil)
		req.Header.Set("X-Hotel-ID", validHotelID)

		resp, err := app.Test(req)
		require.NoError(t, err)
		assert.Equal(t, 500, resp.StatusCode)
	})
}
