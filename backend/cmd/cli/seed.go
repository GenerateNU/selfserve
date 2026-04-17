package main

import (
	"context"
	"errors"
	"fmt"
	"math/rand/v2"
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
	accessible bool
	features  []string
}

var seedRooms = []seedRoom{
	// Floor 1
	{101, 1, "standard", "available", true, []string{"wifi", "tv"}},
	{102, 1, "deluxe", "occupied", false, []string{"wifi", "tv", "minibar"}},
	{103, 1, "suite", "available", false, []string{"wifi", "tv", "jacuzzi", "minibar"}},
	{104, 1, "standard", "available", false, []string{"wifi", "tv"}},
	// Floor 2
	{201, 2, "standard", "available", true, []string{"wifi", "tv"}},
	{202, 2, "deluxe", "occupied", false, []string{"wifi", "tv", "balcony"}},
	{203, 2, "penthouse", "maintenance", false, []string{"wifi", "tv", "kitchen", "jacuzzi"}},
	{204, 2, "standard", "available", false, []string{"wifi", "tv"}},
	// Floor 3
	{301, 3, "standard", "available", false, []string{"wifi", "tv"}},
	{302, 3, "deluxe", "available", true, []string{"wifi", "tv", "balcony"}},
	{303, 3, "suite", "occupied", false, []string{"wifi", "tv", "jacuzzi", "minibar", "balcony"}},
	{304, 3, "standard", "available", false, []string{"wifi", "tv"}},
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
	priority     models.RequestPriority
	status       models.RequestStatus
	assignToUser bool
	// roomIndex is the index into the inserted rooms slice. -1 means no room.
	roomIndex int
}

var seedRequests = []seedRequest{
	// High priority
	// roomIndex 2 = room 103 (suite), 7 = room 204, 11 = room 304
	{"Fix broken AC in suite", "Guest reported AC not working since check-in", models.PriorityHigh, models.StatusPending, false, 2},
	{"Flooding in room 204", "Toilet overflow — housekeeping and maintenance needed immediately", models.PriorityHigh, models.StatusInProgress, true, 7},
	{"Medical equipment needed", "Guest requires wheelchair for lobby transit", models.PriorityHigh, models.StatusInProgress, true, -1},
	{"Fire alarm panel fault", "Panel showing fault on floor 3 — inspect before end of shift", models.PriorityHigh, models.StatusPending, false, -1},

	// Medium priority
	// roomIndex 0 = room 101, 5 = room 202, 9 = room 302, 3 = room 104
	{"Extra towels and toiletries", "Guest requested two sets of towels and extra shampoo", models.PriorityMedium, models.StatusPending, false, 0},
	{"Room service delivery", "Breakfast for two, requested via in-room tablet", models.PriorityMedium, models.StatusInProgress, true, 9},
	{"Late checkout request", "Guest requesting checkout at 2pm instead of 11am", models.PriorityMedium, models.StatusPending, false, 5},
	{"Replace burnt-out bulbs", "Two bulbs out in bathroom", models.PriorityMedium, models.StatusInProgress, true, 3},
	{"Minibar restock", "Minibar needs full restock after checkout", models.PriorityMedium, models.StatusPending, false, 5},
	{"Dinner reservation assist", "Guest needs help booking a table for 4 tonight", models.PriorityMedium, models.StatusCompleted, true, -1},

	// Low priority
	// roomIndex 10 = room 303, 0 = room 101, 1 = room 102
	{"Extra pillow request", "Guest requested two additional pillows", models.PriorityLow, models.StatusPending, false, 10},
	{"Lost & found inquiry", "Guest asking about a left-behind phone charger from yesterday", models.PriorityLow, models.StatusCompleted, false, -1},
	{"Pool towel replenishment", "Pool deck running low on towels — restock from laundry", models.PriorityLow, models.StatusInProgress, true, -1},
	{"Newspaper delivery", "Daily newspaper delivery requested for the week", models.PriorityLow, models.StatusPending, false, 1},
	{"Gym equipment wipe-down", "Routine sanitisation of gym equipment requested by guest", models.PriorityLow, models.StatusCompleted, false, -1},
	{"Wine pairing recommendation", "Couple would like a wine pairing recommendation for their dinner", models.PriorityLow, models.StatusPending, false, -1},
	{"Print boarding passes", "Guest needs three boarding passes printed at concierge", models.PriorityLow, models.StatusInProgress, true, -1},
	{"Deep clean after checkout", "Full deep clean required before next guest", models.PriorityLow, models.StatusCompleted, false, 11},
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
	hotelsRepo := repository.NewHotelsRepository(repo.DB)

	user, err := usersRepo.FindUser(ctx, userID)
	if err != nil {
		if errors.Is(err, errs.ErrNotFoundInDB) {
			return fmt.Errorf("user %q not found", userID)
		}
		return fmt.Errorf("failed to fetch user: %w", err)
	}

	hotelID := user.HotelID
	fmt.Printf("seeding data for hotel %s (user: %s)\n\n", hotelID, userID)

	// ── Departments ────────────────────────────────────────────────────────────
	departments, err := hotelsRepo.GetDepartmentsByHotelID(ctx, hotelID)
	if err != nil {
		return fmt.Errorf("failed to fetch departments: %w", err)
	}
	if len(departments) == 0 {
		return fmt.Errorf("hotel %s has no departments — run backfill-hotel-departments first", hotelID)
	}
	departmentIDs := make([]string, len(departments))
	for i, d := range departments {
		departmentIDs[i] = d.ID
	}
	fmt.Printf("found %d departments\n\n", len(departmentIDs))

	// ── Rooms ──────────────────────────────────────────────────────────────────
	fmt.Println("inserting rooms...")
	insertedRooms := make([]*models.Room, len(seedRooms))
	for i, s := range seedRooms {
		room, err := roomsRepo.InsertRoom(ctx, hotelID, s.number, s.floor, s.suiteType, s.status, s.accessible, s.features)
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
		deptID := departmentIDs[rand.IntN(len(departmentIDs))]
		req := &models.Request{
			ID: uuid.New().String(),
			MakeRequest: models.MakeRequest{
				HotelID:     hotelID,
				Name:        s.name,
				Description: ptr(s.description),
				Department:  ptr(deptID),
				RequestType: "manual",
				Status:      string(s.status),
				Priority:    string(s.priority),
			},
		}
		if s.assignToUser {
			req.UserID = &userID
		}
		if s.roomIndex >= 0 && s.roomIndex < len(insertedRooms) {
			req.RoomID = ptr(insertedRooms[s.roomIndex].ID)
		}
		if _, err := requestsRepo.InsertRequest(ctx, req); err != nil {
			return fmt.Errorf("failed to insert request %q: %w", s.name, err)
		}
		roomLabel := "-"
		if s.roomIndex >= 0 && s.roomIndex < len(insertedRooms) {
			roomLabel = fmt.Sprintf("room %d", insertedRooms[s.roomIndex].RoomNumber)
		}
		fmt.Printf("  [%d/%d] %s (%s / %s / %s)\n", i+1, len(seedRequests), s.name, s.priority, s.status, roomLabel)
	}

	fmt.Printf("\nseed-data completed: %d rooms, %d guests, %d requests\n",
		len(seedRooms), len(seedGuests), len(seedRequests))
	return nil
}

func ptr[T any](v T) *T {
	return &v
}
