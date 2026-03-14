package models

type BookingStatus string

const (
	BookingStatusActive   BookingStatus = "active"
	BookingStatusInactive BookingStatus = "inactive"
)

type GuestBooking struct {
	ID            string        `json:"id" example:"f353ca91-4fc5-49f2-9b9e-304f83d11914"`
	Guest         Guest         `json:"guest"`
	Room          Room          `json:"room"`
	Status        BookingStatus `json:"status"`
	ArrivalDate   string        `json:"arrival_date"`
	DepartureDate string        `json:"departure_date"`
} //@name GuestBooking
