package models

type Room struct {
	ID           string `json:"id"`
	RoomNumber   int    `json:"room_number"`
	Floor        int    `json:"floor"`
	SuiteType    string `json:"suite_type"`
	RoomStatus   string `json:"room_status"`
	IsAccessible bool   `json:"is_accessible"`
} //@name Room

type RoomSortOption string

const (
	RoomSortAscending  RoomSortOption = "ascending"
	RoomSortDescending RoomSortOption = "descending"
	RoomSortUrgency    RoomSortOption = "urgency"
)

type FilterRoomsRequest struct {
	Floors     *[]int         `json:"floors,omitempty"     validate:"omitempty,dive,min=1"`
	Limit      int            `json:"limit,omitempty"      validate:"min=0"`
	Cursor     string         `json:"cursor,omitempty"     validate:"omitempty"`
	Status     []string       `json:"status,omitempty"`     // occupied | vacant | open-tasks
	Attributes []string       `json:"attributes,omitempty"` // standard | deluxe | suite | accessible
	Advanced   []string       `json:"advanced,omitempty"`   // arrivals-today | departures-today
	Sort       RoomSortOption `json:"sort,omitempty"`
} //@name FilterRoomsRequest

// Read model for rooms page on the frontend
type RoomWithOptionalGuestBooking struct {
	Room
	Guests             []Guest         `json:"guests"`
	BookingStatus      BookingStatus   `json:"booking_status"`
	Priority           RequestPriority `json:"priority"`
	HasUnassignedTasks bool            `json:"has_unassigned_tasks"`
} //@name RoomWithOptionalGuestBooking
