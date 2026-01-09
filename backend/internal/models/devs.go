package models

import "time"

type Dev struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Member    string    `json:"member"`
}

type AllDevsResponse struct {
	Devs []Dev `json:"devs"`
}
