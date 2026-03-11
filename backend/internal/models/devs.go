package models

import "time"

type Dev struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	Name      string    `json:"name" example:"Dao Ho"`
} //@name Dev
