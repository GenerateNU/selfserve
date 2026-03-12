package models

type Room struct {
    RoomNumber int    `json:"room_number"`
    Floor      int    `json:"floor"`
    SuiteType  string `json:"suite_type"`
    RoomStatus string `json:"room_status"`
} //@name Room

type RoomFilter struct {
    Floors *[]int `query:"floors"`
} 

// Read model for rooms page on the frontend
type RoomWithBooking struct {
	Room
	FirstName     *string        `json:"first_name"`
	LastName      *string        `json:"last_name"`
	BookingStatus *BookingStatus `json:"booking_status"`
} //@name RoomWithBooking