package models

type GuestBooking struct { 
	ID  string `json:"id" example:"f353ca91-4fc5-49f2-9b9e-304f83d11914"`
	Guest
	Room
}