package domain

import "time"

const (
	userTTL                   = 5 * time.Minute
	hotelTTL                  = 15 * time.Minute
	guestTTL                  = 2 * time.Minute
	guestStayHistoryTTL       = 1 * time.Minute
	guestBookingGroupSizesTTL = 5 * time.Minute
)
