package models

type Room struct {
	RoomNumber int    `json:"room_number"`
	Floor      int    `json:"floor"`
	SuiteType  string `json:"suite_type"`
	RoomStatus string `json:"room_status"`
} //@name Room

type FilterRoomsRequest struct {
	Floors *[]int `json:"floors,omitempty" validate:"omitempty,dive,min=1"`
	Limit  int    `json:"limit,omitempty"  validate:"min=0"`
	Cursor string `json:"cursor,omitempty" validate:"omitempty"`
} //@name FilterRoomsRequest

// Read model for rooms page on the frontend
type RoomWithOptionalGuestBooking struct {
	Room
	Guests        []Guest       `json:"guests"`
	BookingStatus BookingStatus `json:"booking_status"`
} //@name RoomWithOptionalGuestBooking
