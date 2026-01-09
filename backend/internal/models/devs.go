package models

import "time"

type Devs struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Member    string    `json:"member"`
}

type AllDevsResponse struct {
	Devs []Devs `json:"devs"`
}
