package utils

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/generate/selfserve/internal/models"
)

const taskCursorVersion = 2

type taskCursorPayload struct {
	V   int       `json:"v"`
	Tab string    `json:"tab"`
	PR  int       `json:"pr"`
	DK  string    `json:"dk"`
	CA  time.Time `json:"ca"`
	ID  string    `json:"id"`
}

// PriorityRank maps stored priority strings to a numeric rank (higher = more urgent).
func PriorityRank(priority string) int {
	switch strings.ToLower(strings.TrimSpace(priority)) {
	case "urgent":
		return 4
	case "high":
		return 3
	case "medium", "middle":
		return 2
	case "low":
		return 1
	default:
		return 0
	}
}

// DepartmentKey normalizes department for sorting and cursors.
func DepartmentKey(dept *string) string {
	if dept == nil {
		return ""
	}
	return strings.ToLower(strings.TrimSpace(*dept))
}

// EncodeTaskCursor builds an opaque cursor for the given sort key.
func EncodeTaskCursor(tab models.TaskTab, priorityRank int, deptKey string, createdAt time.Time, id string) (string, error) {
	p := taskCursorPayload{
		V:   taskCursorVersion,
		Tab: string(tab),
		PR:  priorityRank,
		DK:  deptKey,
		CA:  createdAt.UTC(),
		ID:  id,
	}
	raw, err := json.Marshal(p)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(raw), nil
}

// DecodeTaskCursor parses and validates a cursor; returns payload fields.
func DecodeTaskCursor(encoded string, expectedTab models.TaskTab) (priorityRank int, deptKey string, createdAt time.Time, id string, err error) {
	encoded = strings.TrimSpace(encoded)
	if encoded == "" {
		return 0, "", time.Time{}, "", errors.New("empty cursor")
	}
	raw, err := base64.RawURLEncoding.DecodeString(encoded)
	if err != nil {
		return 0, "", time.Time{}, "", errors.New("invalid cursor encoding")
	}
	var p taskCursorPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return 0, "", time.Time{}, "", errors.New("invalid cursor payload")
	}
	if p.V != taskCursorVersion {
		return 0, "", time.Time{}, "", errors.New("unsupported cursor version")
	}
	if models.TaskTab(p.Tab) != expectedTab {
		return 0, "", time.Time{}, "", errors.New("cursor does not match tab")
	}
	if p.ID == "" {
		return 0, "", time.Time{}, "", errors.New("invalid cursor id")
	}
	return p.PR, p.DK, p.CA.UTC(), p.ID, nil
}
