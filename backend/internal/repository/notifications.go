package repository

import (
	"context"
	"encoding/json"
	"time"

	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationsRepository struct {
	db *pgxpool.Pool
}

func NewNotificationsRepository(db *pgxpool.Pool) *NotificationsRepository {
	return &NotificationsRepository{db: db}
}

func (r *NotificationsRepository) InsertNotification(ctx context.Context, userID string, notifType models.NotificationType, title, body string) (*models.Notification, error) {
	n := &models.Notification{
		ID:     uuid.New().String(),
		UserID: userID,
		Type:   notifType,
		Title:  title,
		Body:   body,
	}
	err := r.db.QueryRow(ctx, `
		INSERT INTO public.notifications (id, user_id, type, title, body)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at
	`, n.ID, n.UserID, n.Type, n.Title, n.Body).Scan(&n.CreatedAt)
	if err != nil {
		return nil, err
	}
	return n, nil
}

func (r *NotificationsRepository) FindByUserID(ctx context.Context, userID string, before *time.Time) ([]*models.Notification, error) {
	var rows pgx.Rows
	var err error
	if before != nil {
		rows, err = r.db.Query(ctx, `
			SELECT id, user_id, type, title, body, data, read_at, created_at
			FROM public.notifications
			WHERE user_id = $1 AND created_at < $2
			ORDER BY created_at DESC
			LIMIT 50
		`, userID, before)
	} else {
		rows, err = r.db.Query(ctx, `
			SELECT id, user_id, type, title, body, data, read_at, created_at
			FROM public.notifications
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT 50
		`, userID)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*models.Notification
	for rows.Next() {
		n := &models.Notification{}
		var data []byte
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Body, &data, &n.ReadAt, &n.CreatedAt); err != nil {
			return nil, err
		}
		if data != nil {
			n.Data = json.RawMessage(data)
		}
		notifications = append(notifications, n)
	}
	return notifications, rows.Err()
}

func (r *NotificationsRepository) MarkRead(ctx context.Context, id, userID string) error {
	result, err := r.db.Exec(ctx, `
		UPDATE public.notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2 AND read_at IS NULL
	`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errs.ErrNotFoundInDB
	}
	return nil
}

func (r *NotificationsRepository) MarkAllRead(ctx context.Context, userID string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE public.notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL
	`, userID)
	return err
}

func (r *NotificationsRepository) UpsertDeviceToken(ctx context.Context, userID, token, platform string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO public.device_tokens (user_id, token, platform)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, token) DO NOTHING
	`, userID, token, platform)
	return err
}

func (r *NotificationsRepository) FindDeviceTokensByUserID(ctx context.Context, userID string) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT token FROM public.device_tokens WHERE user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []string
	for rows.Next() {
		var token string
		if err := rows.Scan(&token); err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
	}
	return tokens, rows.Err()
}
