package notifications

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/generate/selfserve/internal/models"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
)

const expoPushURL = "https://exp.host/--/exponent-push-api/v2/push/send"

// NotificationSender is implemented by Service. Handlers that trigger
// notifications depend on this interface for testability.
type NotificationSender interface {
	Notify(ctx context.Context, userID string, notifType models.NotificationType, title, body string) error
}

type Service struct {
	repo   storage.NotificationsRepository
	client *http.Client
}

func NewService(repo storage.NotificationsRepository) *Service {
	return &Service{
		repo:   repo,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

// Notify persists an in-app notification and fires an Expo push to any
// registered device tokens (fire-and-forget — push errors are logged only).
func (s *Service) Notify(ctx context.Context, userID string, notifType models.NotificationType, title, body string) error {
	if _, err := s.repo.InsertNotification(ctx, userID, notifType, title, body); err != nil {
		return err
	}

	tokens, err := s.repo.FindDeviceTokensByUserID(ctx, userID)
	if err != nil {
		slog.Error("notifications: failed to fetch device tokens", "user_id", userID, "err", err)
		return nil
	}

	if len(tokens) > 0 {
		go s.sendExpoPush(tokens, title, body)
	}

	return nil
}

type expoMessage struct {
	To    string `json:"to"`
	Title string `json:"title"`
	Body  string `json:"body"`
}

func (s *Service) sendExpoPush(tokens []string, title, body string) {
	msgs := make([]expoMessage, len(tokens))
	for i, t := range tokens {
		msgs[i] = expoMessage{To: t, Title: title, Body: body}
	}

	payload, err := json.Marshal(msgs)
	if err != nil {
		slog.Error("notifications: failed to marshal expo payload", "err", err)
		return
	}

	resp, err := s.client.Post(expoPushURL, "application/json", bytes.NewReader(payload))
	if err != nil {
		slog.Error("notifications: expo push failed", "err", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		slog.Error("notifications: expo push returned error status", "status", resp.StatusCode)
	}
}
