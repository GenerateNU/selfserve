package repository

import (
	"testing"
	"time"

	"github.com/generate/selfserve/internal/models"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFormatPGTime(t *testing.T) {
	t.Parallel()

	t.Run("returns nil for invalid value", func(t *testing.T) {
		t.Parallel()

		assert.Nil(t, formatPGTime(pgtype.Time{}))
	})

	t.Run("formats valid time as hh:mm:ss", func(t *testing.T) {
		t.Parallel()

		formatted := formatPGTime(pgtype.Time{
			Microseconds: ((17 * int64(time.Hour)) + (5 * int64(time.Minute)) + (9 * int64(time.Second))) / int64(time.Microsecond),
			Valid:        true,
		})

		require.NotNil(t, formatted)
		assert.Equal(t, "17:05:09", *formatted)
	})
}

func TestBuildStay(t *testing.T) {
	t.Parallel()

	t.Run("maps pg values into stay", func(t *testing.T) {
		t.Parallel()

		arrival := time.Date(2026, time.April, 10, 0, 0, 0, 0, time.UTC)
		departure := time.Date(2026, time.April, 15, 0, 0, 0, 0, time.UTC)

		stay := buildStay(
			pgtype.Date{Time: arrival, Valid: true},
			pgtype.Date{Time: departure, Valid: true},
			pgtype.Int4{Int32: 401, Valid: true},
			pgtype.Int4{Int32: 3, Valid: true},
			models.BookingStatusActive,
		)

		require.NotNil(t, stay.GroupSize)
		assert.Equal(t, arrival, stay.ArrivalDate)
		assert.Equal(t, departure, stay.DepartureDate)
		assert.Equal(t, 401, stay.RoomNumber)
		assert.Equal(t, 3, *stay.GroupSize)
		assert.Equal(t, models.BookingStatusActive, stay.Status)
	})

	t.Run("omits group size when invalid", func(t *testing.T) {
		t.Parallel()

		stay := buildStay(
			pgtype.Date{Time: time.Date(2026, time.April, 10, 0, 0, 0, 0, time.UTC), Valid: true},
			pgtype.Date{Time: time.Date(2026, time.April, 15, 0, 0, 0, 0, time.UTC), Valid: true},
			pgtype.Int4{Int32: 401, Valid: true},
			pgtype.Int4{},
			models.BookingStatusInactive,
		)

		assert.Nil(t, stay.GroupSize)
	})
}

func TestDecodeAssistance(t *testing.T) {
	t.Parallel()

	t.Run("returns nil for null assistance payload", func(t *testing.T) {
		t.Parallel()

		assistance, err := decodeAssistance([]byte("null"))
		require.NoError(t, err)
		assert.Nil(t, assistance)
	})

	t.Run("decodes assistance json", func(t *testing.T) {
		t.Parallel()

		assistance, err := decodeAssistance([]byte(`{"dietary":["peanuts"],"accessibility":["wheelchair"],"medical":["pollen allergy"]}`))
		require.NoError(t, err)
		require.NotNil(t, assistance)
		assert.Equal(t, []string{"peanuts"}, assistance.Dietary)
		assert.Equal(t, []string{"wheelchair"}, assistance.Accessibility)
		assert.Equal(t, []string{"pollen allergy"}, assistance.Medical)
	})
}

func TestAppendStay(t *testing.T) {
	t.Parallel()

	activeStay := models.Stay{RoomNumber: 101, Status: models.BookingStatusActive}
	pastStay := models.Stay{RoomNumber: 202, Status: models.BookingStatusInactive}

	guest := &models.GuestWithStays{}
	appendStay(guest, activeStay, models.BookingStatusActive)
	appendStay(guest, pastStay, models.BookingStatusInactive)

	require.Len(t, guest.CurrentStays, 1)
	require.Len(t, guest.PastStays, 1)
	assert.Equal(t, 101, guest.CurrentStays[0].RoomNumber)
	assert.Equal(t, 202, guest.PastStays[0].RoomNumber)
}

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
