package models

type Room struct {
	RoomNumber int    `json:"room_number"`
	Floor      int    `json:"floor"`
	SuiteType  string `json:"suite_type"`
	RoomStatus string `json:"room_status"`
} //@name Room

type RoomFilter struct {
	Floors *[]int `query:"floors"`
	Limit  int    `query:"limit"`
}

// Read model for rooms page on the frontend
type RoomWithOptionalGuestBooking struct {
	Room
	Guests        []Guest       `json:"guests"`
	BookingStatus BookingStatus `json:"booking_status"`
} //@name RoomWithOptionalGuestBooking
