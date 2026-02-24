package models

import "time"

type RoomType string

const (
	RoomTypeSingle RoomType = "single"
	RoomTypeDouble RoomType = "double"
	RoomTypeQueen  RoomType = "queen"
	RoomTypeKing   RoomType = "king"
)

type CreateRoom struct {
	ID         string    `json:"id"`
	RoomNumber int       `json:"room_number"`
	Floor      int       `json:"floor"`
	RoomType   RoomType  `json:"room_type"`
	Features   []string  `json:"features"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
} //@name CreateRoom

type Room struct {
	CreateRoom
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
} //@name Room

type RoomFilters struct {
	Floors    []int      `json:"floors"`
	RoomTypes []RoomType `json:"room_types"`
}