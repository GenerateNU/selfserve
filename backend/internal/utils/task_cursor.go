package utils

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"time"

	"github.com/generate/selfserve/internal/models"
)

const taskCursorVersion = 2

type taskCursorPayload struct {
	V   int    `json:"v"`
	Tab string `json:"tab"`
	Pr  int    `json:"pr"`
	Dk  string `json:"dk"`
	T   string `json:"t"`
	ID  string `json:"id"`
}

func EncodeTaskCursor(c models.TaskCursor) (string, error) {
	p := taskCursorPayload{
		V:   taskCursorVersion,
		Tab: string(c.Tab),
		Pr:  c.PriorityRank,
		Dk:  c.DeptKey,
		T:   c.CreatedAt.UTC().Format(time.RFC3339Nano),
		ID:  c.ID,
	}
	b, err := json.Marshal(p)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func DecodeTaskCursor(s string) (*models.TaskCursor, error) {
	if s == "" {
		return nil, nil
	}
	raw, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return nil, err
	}
	var p taskCursorPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return nil, err
	}
	if p.V != taskCursorVersion {
		return nil, errors.New("unsupported task cursor version")
	}
	tab := models.TaskTab(p.Tab)
	if tab != models.TaskTabMy && tab != models.TaskTabUnassigned {
		return nil, errors.New("invalid task cursor tab")
	}
	t, err := time.Parse(time.RFC3339Nano, p.T)
	if err != nil {
		return nil, err
	}
	if p.ID == "" {
		return nil, errors.New("invalid task cursor id")
	}
	return &models.TaskCursor{
		Tab:          tab,
		PriorityRank: p.Pr,
		DeptKey:      p.Dk,
		CreatedAt:    t,
		ID:           p.ID,
	}, nil
}
