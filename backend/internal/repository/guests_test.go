package repository

import (
	"testing"
	"time"

	"github.com/generate/selfserve/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestSortGuestStays(t *testing.T) {
	t.Parallel()

	base := time.Date(2026, time.April, 4, 12, 0, 0, 0, time.UTC)
	guest := &models.GuestWithStays{
		CurrentStays: []models.Stay{
			{
				ArrivalDate:   base.Add(-48 * time.Hour),
				DepartureDate: base.Add(24 * time.Hour),
				RoomNumber:    101,
				Status:        models.BookingStatusActive,
			},
			{
				ArrivalDate:   base.Add(-24 * time.Hour),
				DepartureDate: base.Add(48 * time.Hour),
				RoomNumber:    202,
				Status:        models.BookingStatusActive,
			},
		},
		PastStays: []models.Stay{
			{
				ArrivalDate:   base.Add(-240 * time.Hour),
				DepartureDate: base.Add(-168 * time.Hour),
				RoomNumber:    303,
				Status:        models.BookingStatusInactive,
			},
			{
				ArrivalDate:   base.Add(-120 * time.Hour),
				DepartureDate: base.Add(-72 * time.Hour),
				RoomNumber:    404,
				Status:        models.BookingStatusInactive,
			},
		},
	}

	sortGuestStays(guest)

	assert.Equal(t, 202, guest.CurrentStays[0].RoomNumber)
	assert.Equal(t, 101, guest.CurrentStays[1].RoomNumber)
	assert.Equal(t, 404, guest.PastStays[0].RoomNumber)
	assert.Equal(t, 303, guest.PastStays[1].RoomNumber)
}
