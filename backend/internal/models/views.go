package models

import (
	"encoding/json"
	"time"
)

type View struct {
	ID          string          `json:"id"`
	UserID      string          `json:"user_id"`
	Slug        string          `json:"slug"`
	DisplayName string          `json:"display_name"`
	Filters     json.RawMessage `json:"filters"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
} //@name View

type CreateViewInput struct {
	Slug        string          `json:"slug"         validate:"notblank"`
	DisplayName string          `json:"display_name" validate:"notblank"`
	Filters     json.RawMessage `json:"filters"      validate:"required"`
} //@name CreateViewInput
