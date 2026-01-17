package models

import "time"

type Hotel struct {
    ID        string    `json:"id" db:"id"`
    Name      string    `json:"name" db:"name"`
    Floors    int       `json:"floors" db:"floors"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}