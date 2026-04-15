package main

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/models"
	"github.com/generate/selfserve/internal/repository"
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/google/uuid"
)

// ─── Seed data ────────────────────────────────────────────────────────────────

type seedRoom struct {
	number    int
	floor     int
	suiteType string
	status    string
	features  []string
}

var seedRooms = []seedRoom{
	// Floor 1
	{101, 1, "standard", "available", []string{"wifi", "tv"}},
	{102, 1, "deluxe", "occupied", []string{"wifi", "tv", "minibar"}},
	{103, 1, "suite", "available", []string{"wifi", "tv", "jacuzzi", "minibar"}},
	{104, 1, "standard", "available", []string{"wifi", "tv"}},
	// Floor 2
	{201, 2, "standard", "available", []string{"wifi", "tv"}},
	{202, 2, "deluxe", "occupied", []string{"wifi", "tv", "balcony"}},
	{203, 2, "penthouse", "maintenance", []string{"wifi", "tv", "kitchen", "jacuzzi"}},
	{204, 2, "standard", "available", []string{"wifi", "tv"}},
	// Floor 3
	{301, 3, "standard", "available", []string{"wifi", "tv"}},
	{302, 3, "deluxe", "available", []string{"wifi", "tv", "balcony"}},
	{303, 3, "suite", "occupied", []string{"wifi", "tv", "jacuzzi", "minibar", "balcony"}},
	{304, 3, "standard", "available", []string{"wifi", "tv"}},
}

type seedGuest struct {
	firstName string
	lastName  string
	timezone  string
	// roomIndex is the index into the inserted rooms slice for an active booking.
	// -1 means no booking.
	roomIndex int
}

var seedGuests = []seedGuest{
	{"Alice", "Johnson", "America/New_York", 1},      // room 102
	{"Bob", "Smith", "America/Chicago", 5},           // room 202
	{"Carol", "Williams", "America/Los_Angeles", 10}, // room 303
	{"David", "Brown", "Europe/London", -1},
	{"Emma", "Davis", "America/New_York", -1},
	{"Liam", "Garcia", "America/Denver", -1},
}

type seedRequest struct {
	name         string
	description  string
	department   string
	priority     models.RequestPriority
	status       models.RequestStatus
	assignToUser bool
}

var seedRequests = []seedRequest{
	// High priority
	{"Fix broken AC in suite", "Guest reported AC not working since check-in", "Maintenance", models.PriorityHigh, models.StatusPending, false},
	{"Flooding in room 204", "Toilet overflow — housekeeping and maintenance needed immediately", "Housekeeping", models.PriorityHigh, models.StatusInProgress, true},
	{"Medical equipment needed", "Guest requires wheelchair for lobby transit", "Front Desk", models.PriorityHigh, models.StatusInProgress, true},
	{"Fire alarm panel fault", "Panel showing fault on floor 3 — inspect before end of shift", "Maintenance", models.PriorityHigh, models.StatusPending, false},

	// Medium priority
	{"Extra towels and toiletries", "Room 401 — guest requested two sets of towels and extra shampoo", "Housekeeping", models.PriorityMedium, models.StatusPending, false},
	{"Room service delivery", "Breakfast for two to room 312 at 8am", "Food & Beverage", models.PriorityMedium, models.StatusInProgress, true},
	{"Late checkout request", "Guest in 509 requesting checkout at 2pm instead of 11am", "Front Desk", models.PriorityMedium, models.StatusPending, false},
	{"Replace burnt-out bulbs", "Two bulbs out in room 118 bathroom", "Maintenance", models.PriorityMedium, models.StatusInProgress, true},
	{"Minibar restock", "Room 220 minibar needs full restock after checkout", "Housekeeping", models.PriorityMedium, models.StatusPending, false},
	{"Dinner reservation assist", "Guest needs help booking a table for 4 tonight", "Food & Beverage", models.PriorityMedium, models.StatusCompleted, true},

	// Low priority
	{"Extra pillow request", "Room 305 — guest requested two additional pillows", "Housekeeping", models.PriorityLow, models.StatusPending, false},
	{"Lost & found inquiry", "Guest asking about a left-behind phone charger from yesterday", "Front Desk", models.PriorityLow, models.StatusCompleted, false},
	{"Pool towel replenishment", "Pool deck running low on towels — restock from laundry", "Housekeeping", models.PriorityLow, models.StatusInProgress, true},
	{"Newspaper delivery", "Room 102 — daily newspaper delivery requested for the week", "Front Desk", models.PriorityLow, models.StatusPending, false},
	{"Gym equipment wipe-down", "Routine sanitisation of gym equipment requested by guest", "Maintenance", models.PriorityLow, models.StatusCompleted, false},
	{"Wine pairing recommendation", "Couple in room 410 would like a wine pairing for their dinner", "Food & Beverage", models.PriorityLow, models.StatusPending, false},
	{"Print boarding passes", "Guest needs three boarding passes printed at concierge", "Front Desk", models.PriorityLow, models.StatusInProgress, true},
	{"Deep clean after checkout", "Room 508 — full deep clean required before next guest", "Housekeeping", models.PriorityLow, models.StatusCompleted, false},
}

// ─── Command ──────────────────────────────────────────────────────────────────

func runSeedData(ctx context.Context, cfg config.Config, args []string) error {
	if len(args) == 0 {
		return errors.New("usage: seed-data <user-id>")
	}
	userID := args[0]

	repo, err := storage.NewRepository(cfg.DB)
	if err != nil {
		return fmt.Errorf("failed to connect to db: %w", err)
	}
	defer repo.Close()

	usersRepo := repository.NewUsersRepository(repo.DB)
	roomsRepo := repository.NewRoomsRepository(repo.DB)
	guestsRepo := repository.NewGuestsRepository(repo.DB)
	bookingsRepo := repository.NewGuestBookingsRepository(repo.DB)
	requestsRepo := repository.NewRequestsRepo(repo.DB)

	user, err := usersRepo.FindUser(ctx, userID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return fmt.Errorf("user %q not found", userID)
		}
		return fmt.Errorf("failed to fetch user: %w", err)
	}

	hotelID := user.HotelID
	fmt.Printf("seeding data for hotel %s (user: %s)\n\n", hotelID, userID)

	// ── Rooms ──────────────────────────────────────────────────────────────────
	fmt.Println("inserting rooms...")
	insertedRooms := make([]*models.Room, len(seedRooms))
	for i, s := range seedRooms {
		room, err := roomsRepo.InsertRoom(ctx, hotelID, s.number, s.floor, s.suiteType, s.status, s.features)
		if err != nil {
			return fmt.Errorf("failed to insert room %d: %w", s.number, err)
		}
		insertedRooms[i] = room
		fmt.Printf("  room %d (floor %d, %s)\n", room.RoomNumber, room.Floor, room.SuiteType)
	}

	// ── Guests + bookings ──────────────────────────────────────────────────────
	fmt.Println("\ninserting guests...")
	now := time.Now()
	arrival := now.AddDate(0, 0, -3)
	departure := now.AddDate(0, 0, 4)

	for _, s := range seedGuests {
		guest, err := guestsRepo.InsertGuest(ctx, &models.CreateGuest{
			FirstName: s.firstName,
			LastName:  s.lastName,
			Timezone:  ptr(s.timezone),
		})
		if err != nil {
			return fmt.Errorf("failed to insert guest %s %s: %w", s.firstName, s.lastName, err)
		}
		fmt.Printf("  %s %s", guest.FirstName, guest.LastName)

		if s.roomIndex >= 0 && s.roomIndex < len(insertedRooms) {
			room := insertedRooms[s.roomIndex]
			if err := bookingsRepo.InsertGuestBooking(ctx, guest.ID, room.ID, hotelID, arrival, departure); err != nil {
				return fmt.Errorf("failed to insert booking for guest %s: %w", guest.ID, err)
			}
			fmt.Printf(" → room %d", room.RoomNumber)
		}
		fmt.Println()
	}

	// ── Requests ───────────────────────────────────────────────────────────────
	fmt.Println("\ninserting requests...")
	for i, s := range seedRequests {
		req := &models.Request{
			ID: uuid.New().String(),
			MakeRequest: models.MakeRequest{
				HotelID:     hotelID,
				Name:        s.name,
				Description: ptr(s.description),
				Department:  ptr(s.department),
				RequestType: "manual",
				Status:      string(s.status),
				Priority:    string(s.priority),
			},
		}
		if s.assignToUser {
			req.UserID = &userID
		}
		if _, err := requestsRepo.InsertRequest(ctx, req); err != nil {
			return fmt.Errorf("failed to insert request %q: %w", s.name, err)
		}
		fmt.Printf("  [%d/%d] %s (%s / %s)\n", i+1, len(seedRequests), s.name, s.priority, s.status)
	}

	fmt.Printf("\nseed-data completed: %d rooms, %d guests, %d requests\n",
		len(seedRooms), len(seedGuests), len(seedRequests))
	return nil
}

func ptr[T any](v T) *T {
	return &v
}
