import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { GuestProfilePageSkeleton } from "../components/guests/GuestProfilePageSkeleton";
import { GuestProfileCard } from "../components/guests/GuestProfileCard";
import { GuestQuickListTable } from "../components/guests/GuestQuickListTable";
import { GuestDetailsDrawer } from "../components/guests/GuestDetailsDrawer";
import { GuestProfileTab } from "../components/guests/GuestProfileTab";
import { formatDate } from "../utils/dates";
import type { GuestWithBooking, GuestWithStays, GuestRequest } from "@shared";
import * as guestsEndpoints from "@shared/api/generated/endpoints/guests/guests";
import * as requestsEndpoints from "@shared/api/generated/endpoints/requests/requests";

describe("guest UI helpers", () => {
  describe("formatDate", () => {
    it("formats ISO dates without shifting the calendar day", () => {
      expect(formatDate("2024-01-02")).toBe("01/02/2024");
      expect(formatDate("2024-01-02T00:00:00Z")).toBe("01/02/2024");
    });
  });

  describe("GuestQuickListTable", () => {
    it("does not show the empty state while the first page is loading", () => {
      render(
        <GuestQuickListTable guests={[]} isLoading onGuestClick={() => {}} />,
      );

      expect(screen.queryByText("No guests match your current filters.")).toBe(
        null,
      );
    });

    it("renders the correct column headers", () => {
      render(<GuestQuickListTable guests={[]} onGuestClick={() => {}} />);

      expect(screen.getByText("Guest")).not.toBe(null);
      expect(screen.getByText("Specific Needs")).not.toBe(null);
      expect(screen.getByText("Active Bookings")).not.toBe(null);
      expect(screen.getByText("Requests")).not.toBe(null);
    });

    it("renders a booking pill with floor and suite number", () => {
      const guest: GuestWithBooking = {
        id: "guest-1",
        first_name: "Ada",
        last_name: "Lovelace",
        preferred_name: "Ada",
        floor: 4,
        group_size: 2,
        room_number: 401,
      };

      render(<GuestQuickListTable guests={[guest]} onGuestClick={() => {}} />);

      expect(screen.getByText("Floor 4, Suite 401")).not.toBe(null);
    });

    it("renders preferred name in parens when it differs from first name", () => {
      const guest: GuestWithBooking = {
        id: "guest-2",
        first_name: "Xinning",
        last_name: "Liu",
        preferred_name: "Lucy",
        floor: 3,
        group_size: 1,
        room_number: 301,
      };

      render(<GuestQuickListTable guests={[guest]} onGuestClick={() => {}} />);

      expect(screen.getByText("Xinning Liu")).not.toBe(null);
      expect(screen.getByText("(Lucy)")).not.toBe(null);
    });
  });

  describe("GuestQuickListTable click handler", () => {
    it("calls onGuestClick with the guest id when a row is clicked", async () => {
      const handleClick = vi.fn();
      const guest: GuestWithBooking = {
        id: "g-123",
        first_name: "Layla",
        last_name: "Hassan",
        preferred_name: "Layla",
        floor: 2,
        group_size: 1,
        room_number: 201,
      };

      render(
        <GuestQuickListTable
          guests={[guest]}
          onGuestClick={handleClick}
        />,
      );

      await userEvent.click(screen.getByText("Layla Hassan"));
      expect(handleClick).toHaveBeenCalledWith("g-123");
    });
  });

  describe("GuestProfileCard", () => {
    it("renders current backend guest fields", () => {
      render(
        <GuestProfileCard
          guest={{
            id: "guest-1",
            first_name: "Jane",
            last_name: "Doe",
            phone: "+1 555 111 2222",
            email: "jane@example.com",
            preferences: undefined,
            notes: "VIP",
            pronouns: "she/her",
            do_not_disturb_start: undefined,
            do_not_disturb_end: undefined,
            housekeeping_cadence: undefined,
            assistance: undefined,
            current_stays: [
              {
                arrival_date: "2026-04-10",
                departure_date: "2026-04-15",
                room_number: 301,
                group_size: 2,
                status: "active",
              },
            ],
            past_stays: [],
          }}
        />,
      );

      expect(screen.getByText("Jane Doe")).not.toBe(null);
      expect(screen.getByText("+1 555 111 2222")).not.toBe(null);
      expect(screen.getByText("jane@example.com")).not.toBe(null);
      expect(screen.getByText("she/her")).not.toBe(null);
      expect(screen.getByText("301")).not.toBe(null);
      expect(screen.getByText("2")).not.toBe(null);
    });
  });

  describe("GuestProfilePageSkeleton", () => {
    it("renders multiple skeleton placeholders for the profile page", () => {
      const { container } = render(<GuestProfilePageSkeleton />);

      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        11,
      );
    });
  });
});

const mockGuest: GuestWithStays = {
  id: "g-1",
  first_name: "Ada",
  last_name: "Lovelace",
  pronouns: "she/her",
  email: "ada@example.com",
  phone: "+1 555 000 0001",
  do_not_disturb_start: "22:00",
  do_not_disturb_end: "08:00",
  housekeeping_cadence: "Daily",
  assistance: {
    accessibility: ["Wheelchair ramp"],
    dietary: ["Gluten-free"],
    medical: [],
  },
  notes: "VIP guest",
  current_stays: [
    {
      arrival_date: "2026-04-10",
      departure_date: "2026-04-15",
      room_number: 301,
      group_size: 2,
      status: "active",
    },
  ],
  past_stays: [],
};

describe("GuestDetailsDrawer", () => {
  beforeEach(() => {
    vi.spyOn(guestsEndpoints, "useGetGuestsStaysId").mockReturnValue({
      data: mockGuest,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(guestsEndpoints, "usePutGuestsId").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(requestsEndpoints, "useGetRequestGuestId").mockReturnValue({
      data: [] as GuestRequest[],
      isLoading: false,
      isError: false,
    } as any);
  });

  afterEach(() => vi.restoreAllMocks());

  it("renders the guest full name in the header", () => {
    render(
      <GuestDetailsDrawer
        guestId="g-1"
        activeTab="profile"
        onTabChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Ada Lovelace")).not.toBe(null);
  });

  it("calls onClose when the X button is clicked", async () => {
    const handleClose = vi.fn();
    render(
      <GuestDetailsDrawer
        guestId="g-1"
        activeTab="profile"
        onTabChange={vi.fn()}
        onClose={handleClose}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls onTabChange with 'activity' when Visit Activity tab is clicked", async () => {
    const handleTabChange = vi.fn();
    render(
      <GuestDetailsDrawer
        guestId="g-1"
        activeTab="profile"
        onTabChange={handleTabChange}
        onClose={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("tab", { name: /visit activity/i }));
    expect(handleTabChange).toHaveBeenCalledWith("activity");
  });

  it("shows a loading skeleton when guest data is loading", () => {
    vi.spyOn(guestsEndpoints, "useGetGuestsStaysId").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { container } = render(
      <GuestDetailsDrawer
        guestId="g-1"
        activeTab="profile"
        onTabChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it("shows error message when guest data fails to load", () => {
    vi.spyOn(guestsEndpoints, "useGetGuestsStaysId").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("fetch failed"),
      refetch: vi.fn(),
    } as any);

    render(
      <GuestDetailsDrawer
        guestId="g-1"
        activeTab="profile"
        onTabChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Failed to load guest details.")).not.toBe(null);
  });
});

describe("GuestProfileTab", () => {
  it("renders vital information fields", () => {
    render(
      <GuestProfileTab
        guest={mockGuest}
        onSaveNotes={vi.fn()}
        isSavingNotes={false}
      />,
    );

    expect(screen.getByText("Ada Lovelace")).not.toBe(null);
    expect(screen.getByText("she/her")).not.toBe(null);
    expect(screen.getByText("22:00 \u2013 08:00")).not.toBe(null);
    expect(screen.getByText("Daily")).not.toBe(null);
  });

  it("renders specific assistance chips from all three categories", () => {
    render(
      <GuestProfileTab
        guest={mockGuest}
        onSaveNotes={vi.fn()}
        isSavingNotes={false}
      />,
    );

    expect(screen.getByText("Wheelchair ramp")).not.toBe(null);
    expect(screen.getByText("Gluten-free")).not.toBe(null);
  });

  it("renders notes in read mode and shows edit button", () => {
    render(
      <GuestProfileTab
        guest={mockGuest}
        onSaveNotes={vi.fn()}
        isSavingNotes={false}
      />,
    );

    expect(screen.getByText("VIP guest")).not.toBe(null);
    expect(screen.getByRole("button", { name: /edit/i })).not.toBe(null);
  });

  it("switches notes to edit mode when Edit is clicked", async () => {
    render(
      <GuestProfileTab
        guest={mockGuest}
        onSaveNotes={vi.fn()}
        isSavingNotes={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByRole("textbox")).not.toBe(null);
    expect(screen.getByRole("button", { name: /cancel/i })).not.toBe(null);
    expect(screen.getByRole("button", { name: /save/i })).not.toBe(null);
  });

  it("calls onSaveNotes with the new value", async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    render(
      <GuestProfileTab
        guest={mockGuest}
        onSaveNotes={handleSave}
        isSavingNotes={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    const textarea = screen.getByRole("textbox");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Updated notes");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(handleSave).toHaveBeenCalledWith("Updated notes");
  });

  it("cancels edit and restores original notes", async () => {
    render(
      <GuestProfileTab
        guest={mockGuest}
        onSaveNotes={vi.fn()}
        isSavingNotes={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    const textarea = screen.getByRole("textbox");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Draft that gets discarded");
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("VIP guest")).not.toBe(null);
    expect(screen.queryByRole("textbox")).toBe(null);
  });

  it("shows a dash when DND window is not set", () => {
    render(
      <GuestProfileTab
        guest={{ ...mockGuest, do_not_disturb_start: undefined, do_not_disturb_end: undefined }}
        onSaveNotes={vi.fn()}
        isSavingNotes={false}
      />,
    );

    // The DND row should show "\u2014" instead of a time range
    const dndRow = screen.getByText("Do Not Disturb").closest("div")!;
    expect(dndRow.textContent).toContain("\u2014");
  });
});
