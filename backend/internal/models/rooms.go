package models

type Room struct {
	RoomNumber int    `json:"room_number"`
	Floor      int    `json:"floor"`
	SuiteType  string `json:"suite_type"`
	RoomStatus string `json:"room_status"`
} //@name Room

type RoomFilters struct {
	Floors *[]int `query:"floors"`
	Limit  int    `query:"limit"`
}

type FilterRoomsRequest struct {
	Floors *[]int `json:"floors,omitempty"`
	Limit  int    `json:"limit,omitempty"`
	Cursor string `json:"cursor,omitempty"`
} //@name FilterRoomsRequest

// Read model for rooms page on the frontend
type RoomWithOptionalGuestBooking struct {
	Room
	Guests        []Guest       `json:"guests"`
	BookingStatus BookingStatus `json:"booking_status"`
} //@name RoomWithOptionalGuestBooking
