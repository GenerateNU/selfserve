package models

import (
	"encoding/json"
	"time"
)

type ViewSlug string

const (
	ViewSlugRequestsWeb ViewSlug = "requests_web"
	ViewSlugRoomsWeb    ViewSlug = "rooms_web"
	ViewSlugGuestsWeb   ViewSlug = "guests_web"
)

func IsValidViewSlug(s string) bool {
	switch ViewSlug(s) {
	case ViewSlugRequestsWeb, ViewSlugRoomsWeb, ViewSlugGuestsWeb:
		return true
	}
	return false
}

type View struct {
	ID          string          `json:"id"`
	UserID      string          `json:"user_id"`
	Slug        ViewSlug        `json:"slug"`
	DisplayName string          `json:"display_name"`
	Filters     json.RawMessage `json:"filters"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
} //@name View

type CreateViewInput struct {
	Slug        ViewSlug        `json:"slug"         validate:"required,oneof=requests_web rooms_web guests_web"`
	DisplayName string          `json:"display_name" validate:"notblank"`
	Filters     json.RawMessage `json:"filters"      validate:"required"`
} //@name CreateViewInput

type UpdateViewInput struct {
	Filters json.RawMessage `json:"filters" validate:"required"`
} //@name UpdateViewInput
