package models

import (
	"encoding/json"
	"time"
)

type NotificationType string

const (
	TypeTaskAssigned     NotificationType = "task_assigned"
	TypeHighPriorityTask NotificationType = "high_priority_task"
)

type Notification struct {
	ID        string           `json:"id"`
	UserID    string           `json:"user_id"`
	Type      NotificationType `json:"type"`
	Title     string           `json:"title"`
	Body      string           `json:"body"`
	Data      json.RawMessage  `json:"data,omitempty"`
	ReadAt    *time.Time       `json:"read_at,omitempty"`
	CreatedAt time.Time        `json:"created_at"`
} //@name Notification

type RegisterDeviceTokenInput struct {
	Token    string `json:"token" validate:"notblank"`
	Platform string `json:"platform" validate:"oneof=ios android"`
} //@name RegisterDeviceTokenInput
