package main

import (
	"context"
	"encoding/json"
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
	number     int
	floor      int
	suiteType  string
	status     string
	accessible bool
	features   []string
}

var seedRooms = []seedRoom{
	// Floor 1
	{101, 1, "standard", "available", true, []string{"wifi", "tv"}},
	{102, 1, "deluxe", "occupied", false, []string{"wifi", "tv", "minibar"}},
	{103, 1, "suite", "available", false, []string{"wifi", "tv", "jacuzzi", "minibar"}},
	{104, 1, "standard", "available", false, []string{"wifi", "tv"}},
	// Floor 2
	{201, 2, "standard", "occupied", true, []string{"wifi", "tv"}},
	{202, 2, "deluxe", "occupied", false, []string{"wifi", "tv", "balcony"}},
	{203, 2, "penthouse", "maintenance", false, []string{"wifi", "tv", "kitchen", "jacuzzi"}},
	{204, 2, "standard", "available", false, []string{"wifi", "tv"}},
	// Floor 3
	{301, 3, "standard", "available", false, []string{"wifi", "tv"}},
	{302, 3, "deluxe", "occupied", true, []string{"wifi", "tv", "balcony"}},
	{303, 3, "suite", "occupied", false, []string{"wifi", "tv", "jacuzzi", "minibar", "balcony"}},
	{304, 3, "standard", "available", false, []string{"wifi", "tv"}},
	// Floor 4
	{401, 4, "standard", "available", true, []string{"wifi", "tv"}},
	{402, 4, "deluxe", "occupied", false, []string{"wifi", "tv", "balcony", "sea_view"}},
	{403, 4, "suite", "available", false, []string{"wifi", "tv", "jacuzzi", "minibar", "balcony"}},
	{404, 4, "standard", "maintenance", false, []string{"wifi", "tv"}},
	// Floor 5
	{501, 5, "penthouse", "available", false, []string{"wifi", "tv", "kitchen", "jacuzzi", "balcony"}},
	{502, 5, "penthouse", "occupied", false, []string{"wifi", "tv", "kitchen", "jacuzzi", "balcony", "butler_service"}},
	{503, 5, "standard", "available", true, []string{"wifi", "tv"}},
	{504, 5, "deluxe", "available", false, []string{"wifi", "tv", "balcony"}},
}

type seedGuest struct {
	firstName           string
	lastName            string
	timezone            string
	roomIndex           int // index into insertedRooms; -1 = no booking
	phone               string
	email               string
	preferences         string
	notes               string
	pronouns            string
	dndStart            string              // "HH:MM:SS", empty = not set
	dndEnd              string              // "HH:MM:SS", empty = not set
	housekeepingCadence string              // "daily", "every_other_day", etc.; empty = not set
	assistance          map[string][]string // maps to JSONB {accessibility,dietary,medical}
	groupSize           int                 // 0 = not set
}

var seedGuests = []seedGuest{
	{
		firstName: "Alice", lastName: "Johnson", timezone: "America/New_York", roomIndex: 1,
		phone: "+1 (212) 555-0101", email: "alice.johnson@example.com",
		preferences:         "Extra pillows, Egyptian cotton linens, high floor preferred",
		notes:               "VIP — champagne on arrival. Loyalty member since 2018. Allergy to lavender products.",
		pronouns:            "she/her",
		dndStart:            "22:00:00",
		dndEnd:              "08:00:00",
		housekeepingCadence: "daily",
		assistance:          nil,
		groupSize:           1,
	},
	{
		firstName: "Bob", lastName: "Smith", timezone: "America/Chicago", roomIndex: 5,
		phone: "+1 (312) 555-0102", email: "bob.smith@example.com",
		preferences:         "Hypoallergenic bedding, no feather products, firm pillows",
		notes:               "Corporate account — Acme Corp. Business traveller, early checkout likely.",
		pronouns:            "he/him",
		dndStart:            "23:00:00",
		dndEnd:              "07:00:00",
		housekeepingCadence: "daily",
		assistance:          map[string][]string{"dietary": {"gluten_free"}},
		groupSize:           2,
	},
	{
		firstName: "Carol", lastName: "Williams", timezone: "America/Los_Angeles", roomIndex: 10,
		phone: "+1 (310) 555-0103", email: "carol.williams@example.com",
		preferences:         "No feather pillows, quiet room, low-level floor preferred",
		notes:               "Celebrating anniversary. Requested rose petal turndown on 2026-04-02.",
		pronouns:            "she/her",
		dndStart:            "21:00:00",
		dndEnd:              "09:00:00",
		housekeepingCadence: "every_other_day",
		assistance:          map[string][]string{"medical": {"low_noise_environment"}},
		groupSize:           2,
	},
	{
		firstName: "David", lastName: "Brown", timezone: "Europe/London", roomIndex: -1,
		phone: "+44 20 7946 0104", email: "david.brown@example.com",
		preferences:         "Earl Grey tea on arrival, Financial Times delivered daily",
		notes:               "Regular guest — previous stays in 2024 and 2025. Prefers ground floor.",
		pronouns:            "he/him",
		dndStart:            "",
		dndEnd:              "",
		housekeepingCadence: "daily",
		assistance:          nil,
		groupSize:           0,
	},
	{
		firstName: "Emma", lastName: "Davis", timezone: "America/New_York", roomIndex: 4,
		phone: "+1 (646) 555-0105", email: "emma.davis@example.com",
		preferences:         "Crib required (infant), blackout curtains, quiet room",
		notes:               "Family with 8-month-old infant. Baby amenities pre-arranged.",
		pronouns:            "she/her",
		dndStart:            "20:00:00",
		dndEnd:              "09:00:00",
		housekeepingCadence: "daily",
		assistance:          map[string][]string{"dietary": {"nut_free"}},
		groupSize:           3,
	},
	{
		firstName: "Liam", lastName: "Garcia", timezone: "America/Denver", roomIndex: 9,
		phone: "+1 (720) 555-0106", email: "liam.garcia@example.com",
		preferences:         "Accessible bathroom, roll-in shower, lowered bed if available",
		notes:               "Uses manual wheelchair. Requires accessible room features.",
		pronouns:            "he/him",
		dndStart:            "",
		dndEnd:              "",
		housekeepingCadence: "daily",
		assistance:          map[string][]string{"accessibility": {"wheelchair", "roll_in_shower"}},
		groupSize:           1,
	},
	{
		firstName: "Olivia", lastName: "Martinez", timezone: "America/Los_Angeles", roomIndex: 13,
		phone: "+1 (213) 555-0107", email: "olivia.martinez@example.com",
		preferences:         "Sea view room, sparkling water in minibar, late check-out if available",
		notes:               "Influencer — do not photograph without consent. PR rate applied.",
		pronouns:            "she/her",
		dndStart:            "23:00:00",
		dndEnd:              "10:00:00",
		housekeepingCadence: "every_other_day",
		assistance:          nil,
		groupSize:           1,
	},
	{
		firstName: "Noah", lastName: "Thompson", timezone: "Europe/Paris", roomIndex: 17,
		phone: "+33 1 42 96 0108", email: "noah.thompson@example.com",
		preferences:         "Champagne on ice, fresh flowers daily, butler service preferred",
		notes:               "Penthouse repeat guest. Platinum tier — complimentary airport transfer.",
		pronouns:            "he/him",
		dndStart:            "00:00:00",
		dndEnd:              "11:00:00",
		housekeepingCadence: "twice_daily",
		assistance:          nil,
		groupSize:           2,
	},
	{
		firstName: "Sophie", lastName: "Chen", timezone: "Asia/Shanghai", roomIndex: -1,
		phone: "+86 138 0013 0109", email: "sophie.chen@example.com",
		preferences:         "Mandarin-speaking staff preferred, Chinese breakfast option",
		notes:               "International delegate — attending conference. Translation services arranged.",
		pronouns:            "she/her",
		dndStart:            "",
		dndEnd:              "",
		housekeepingCadence: "daily",
		assistance:          map[string][]string{"dietary": {"vegetarian"}},
		groupSize:           0,
	},
	{
		firstName: "James", lastName: "Wilson", timezone: "America/New_York", roomIndex: -1,
		phone: "+1 (917) 555-0110", email: "james.wilson@example.com",
		preferences:         "Top-floor room, gym access, in-room espresso machine",
		notes:               "Frequent solo traveller. No housekeeping during stay — do not disturb.",
		pronouns:            "he/him",
		dndStart:            "08:00:00",
		dndEnd:              "20:00:00",
		housekeepingCadence: "on_request",
		assistance:          nil,
		groupSize:           0,
	},
}

type seedRequest struct {
	name         string
	description  string
	priority     models.RequestPriority
	status       models.RequestStatus
	assignToUser bool
	roomIndex    int // index into insertedRooms; -1 = no room
}

var seedRequests = []seedRequest{
	// ── High priority ──────────────────────────────────────────────────────────
	{"Fix broken AC in suite", "Guest reported AC not working since check-in. Temperature rising above 28°C.", models.PriorityHigh, models.StatusPending, false, 2},
	{"Flooding in room 204", "Toilet overflow — housekeeping and maintenance needed immediately", models.PriorityHigh, models.StatusInProgress, true, 7},
	{"Medical equipment needed", "Guest requires wheelchair for lobby transit. Confirm accessible lift route.", models.PriorityHigh, models.StatusInProgress, true, -1},
	{"Fire alarm panel fault", "Panel showing fault on floor 3 — inspect before end of shift", models.PriorityHigh, models.StatusPending, false, -1},
	{"Penthouse elevator out of service", "Floor 5 service elevator not responding. Guest unable to access penthouse with luggage.", models.PriorityHigh, models.StatusPending, false, 16},
	{"Burst pipe in room 404", "Water leak reported behind bathroom wall. Room taken out of service.", models.PriorityHigh, models.StatusInProgress, true, 15},

	// ── Medium priority ────────────────────────────────────────────────────────
	{"Extra towels and toiletries", "Guest requested two sets of towels and extra shampoo", models.PriorityMedium, models.StatusPending, false, 0},
	{"Room service delivery", "Breakfast for two, requested via in-room tablet", models.PriorityMedium, models.StatusInProgress, true, 9},
	{"Late checkout request", "Guest requesting checkout at 2pm instead of 11am. Verify availability.", models.PriorityMedium, models.StatusPending, false, 5},
	{"Replace burnt-out bulbs", "Two bulbs out in bathroom and bedside lamp not working", models.PriorityMedium, models.StatusInProgress, true, 3},
	{"Minibar restock", "Minibar needs full restock after checkout", models.PriorityMedium, models.StatusPending, false, 5},
	{"Dinner reservation assist", "Guest needs help booking a table for 4 tonight at a nearby restaurant", models.PriorityMedium, models.StatusCompleted, true, -1},
	{"Baby crib delivery", "Family with infant requesting a standard travel crib with fitted sheet and blanket", models.PriorityMedium, models.StatusPending, false, 4},
	{"WiFi troubleshooting floor 4", "Guest on floor 4 reports WiFi dropping every 30 minutes. Suspected extender issue.", models.PriorityMedium, models.StatusInProgress, true, 12},
	{"Accessible shower seat", "Guest needs a fold-down shower seat installed in accessible bathroom", models.PriorityMedium, models.StatusPending, false, 9},
	{"Sea-view room balcony door stuck", "Balcony door handle loose and door difficult to open from inside", models.PriorityMedium, models.StatusPending, false, 13},

	// ── Low priority ──────────────────────────────────────────────────────────
	{"Extra pillow request", "Guest requested two additional pillows (hypoallergenic)", models.PriorityLow, models.StatusPending, false, 10},
	{"Lost & found inquiry", "Guest asking about a left-behind phone charger from yesterday", models.PriorityLow, models.StatusCompleted, false, -1},
	{"Pool towel replenishment", "Pool deck running low on towels — restock from laundry", models.PriorityLow, models.StatusInProgress, true, -1},
	{"Newspaper delivery", "Daily newspaper delivery requested for the week (Financial Times)", models.PriorityLow, models.StatusPending, false, 1},
	{"Gym equipment wipe-down", "Routine sanitisation of gym equipment requested by guest", models.PriorityLow, models.StatusCompleted, false, -1},
	{"Wine pairing recommendation", "Couple would like a wine pairing recommendation for their dinner", models.PriorityLow, models.StatusPending, false, -1},
	{"Print boarding passes", "Guest needs three boarding passes printed at concierge", models.PriorityLow, models.StatusInProgress, true, -1},
	{"Deep clean after checkout", "Full deep clean required before next guest", models.PriorityLow, models.StatusCompleted, false, 11},
	{"Fresh flowers daily — penthouse", "Penthouse guest requested fresh floral arrangement refreshed each morning", models.PriorityLow, models.StatusPending, false, 17},
	{"Butler service introduction", "New penthouse guest has not met their assigned butler yet", models.PriorityLow, models.StatusPending, true, 17},
	{"Champagne ice bucket top-up", "Ice has melted in penthouse champagne bucket — guest requests fresh ice", models.PriorityLow, models.StatusInProgress, true, 17},
	{"Complimentary airport transfer booking", "Platinum guest departing tomorrow — arrange airport transfer to JFK", models.PriorityLow, models.StatusPending, false, 17},
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
		fmt.Printf("  room %d (floor %d, %s, %s)\n", room.RoomNumber, room.Floor, room.SuiteType, room.RoomStatus)
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

		// Enrich guest with extended profile fields via raw UPDATE.
		var assistanceJSON []byte
		if s.assistance != nil {
			assistanceJSON, err = json.Marshal(s.assistance)
			if err != nil {
				return fmt.Errorf("failed to marshal assistance for guest %s: %w", guest.ID, err)
			}
		} else {
			assistanceJSON = []byte("{}")
		}

		dndStartVal := nullableStr(s.dndStart)
		dndEndVal := nullableStr(s.dndEnd)
		housekeepingVal := nullableStr(s.housekeepingCadence)
		phoneVal := nullableStr(s.phone)
		emailVal := nullableStr(s.email)
		prefsVal := nullableStr(s.preferences)
		notesVal := nullableStr(s.notes)
		pronounsVal := nullableStr(s.pronouns)

		_, err = repo.DB.Exec(ctx, `
			UPDATE guests SET
				phone                = $1,
				email                = $2,
				preferences          = $3,
				notes                = $4,
				pronouns             = $5,
				do_not_disturb_start = $6,
				do_not_disturb_end   = $7,
				housekeeping_cadence = $8,
				assistance           = $9
			WHERE id = $10
		`, phoneVal, emailVal, prefsVal, notesVal, pronounsVal,
			dndStartVal, dndEndVal, housekeepingVal, string(assistanceJSON), guest.ID)
		if err != nil {
			return fmt.Errorf("failed to update guest profile for %s: %w", guest.ID, err)
		}

		fmt.Printf("  %s %s", guest.FirstName, guest.LastName)

		if s.roomIndex >= 0 && s.roomIndex < len(insertedRooms) {
			room := insertedRooms[s.roomIndex]
			if err := bookingsRepo.InsertGuestBooking(ctx, guest.ID, room.ID, hotelID, arrival, departure); err != nil {
				return fmt.Errorf("failed to insert booking for guest %s: %w", guest.ID, err)
			}
			fmt.Printf(" → room %d", room.RoomNumber)

			if s.groupSize > 0 {
				_, err = repo.DB.Exec(ctx, `
					UPDATE guest_bookings SET group_size = $1
					WHERE guest_id = $2 AND room_id = $3 AND hotel_id = $4 AND status = 'active'
				`, s.groupSize, guest.ID, room.ID, hotelID)
				if err != nil {
					return fmt.Errorf("failed to set group_size for guest %s: %w", guest.ID, err)
				}
				fmt.Printf(" (party of %d)", s.groupSize)
			}
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

// nullableStr returns nil if s is empty, otherwise a pointer to s.
func nullableStr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func ptr[T any](v T) *T {
	return &v
}
