import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@shared";
import { describe, expect, it, vi } from "vitest";
import { GuestNotesCard } from "../components/guests/GuestNotesCard";
import { GuestProfilePageSkeleton } from "../components/guests/GuestProfilePageSkeleton";
import { GuestProfileCard } from "../components/guests/GuestProfileCard";
import { GuestQuickListTable } from "../components/guests/GuestQuickListTable";
import { getGuestNotesSaveErrorMessage } from "../components/guests/guest-note-errors";
import { formatDate } from "../utils/dates";
import type { GuestWithBooking } from "@shared";

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
        <GuestQuickListTable
          guests={[]}
          floorOptions={[]}
          groupSizeOptions={[]}
          groupFilter="all"
          floorFilter="all"
          isLoading
          onGroupFilterChange={() => {}}
          onFloorFilterChange={() => {}}
          onGuestClick={() => {}}
        />,
      );

      expect(screen.queryByText("No guests match your current filters.")).toBe(
        null,
      );
    });

    it("renders backend-provided filter options", () => {
      render(
        <GuestQuickListTable
          guests={[]}
          floorOptions={[2, 4]}
          groupSizeOptions={[1, 3, 6]}
          groupFilter="all"
          floorFilter="all"
          onGroupFilterChange={() => {}}
          onFloorFilterChange={() => {}}
          onGuestClick={() => {}}
        />,
      );

      expect(screen.getByRole("option", { name: "2" })).not.toBe(null);
      expect(screen.getByRole("option", { name: "6" })).not.toBe(null);
    });

    it("renders an em dash for a null group size", () => {
      const guest = {
        id: "guest-1",
        first_name: "Ada",
        last_name: "Lovelace",
        preferred_name: "Ada",
        floor: 4,
        group_size: null as unknown as GuestWithBooking["group_size"],
        room_number: 401,
      };

      render(
        <GuestQuickListTable
          guests={[guest]}
          floorOptions={[]}
          groupSizeOptions={[]}
          groupFilter="all"
          floorFilter="all"
          onGroupFilterChange={() => {}}
          onFloorFilterChange={() => {}}
          onGuestClick={() => {}}
        />,
      );

      expect(screen.getByText("—")).not.toBe(null);
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

  describe("GuestNotesCard", () => {
    it("shows pending state while save is in flight", async () => {
      render(
        <GuestNotesCard
          notes="Initial"
          draft="Updated"
          isEditing
          isSaving
          onDraftChange={() => {}}
          onEdit={() => {}}
          onCancel={() => {}}
          onSave={async () => {}}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Saving..." }),
      ).toHaveProperty("disabled", true);
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveProperty(
        "disabled",
        true,
      );
    });

    it("shows an inline error and keeps editing open", async () => {
      render(
        <GuestNotesCard
          notes="Initial"
          draft="Initial"
          isEditing
          errorMessage="Failed to save notes. Please try again."
          onDraftChange={() => {}}
          onEdit={() => {}}
          onCancel={() => {}}
          onSave={async () => {}}
        />,
      );

      expect(
        screen.getByText("Failed to save notes. Please try again."),
      ).not.toBe(null);
      expect(screen.getByRole("textbox")).not.toBe(null);
    });

    it("reflects updated notes after parent props change", async () => {
      const onEdit = vi.fn();
      const onCancel = vi.fn();
      const onSave = vi.fn(async () => {});
      const onDraftChange = vi.fn();

      const { rerender } = render(
        <GuestNotesCard
          notes="Initial"
          draft="Initial"
          isEditing={false}
          onDraftChange={onDraftChange}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      expect(onEdit).toHaveBeenCalledTimes(1);

      rerender(
        <GuestNotesCard
          notes="Updated"
          draft="Updated"
          isEditing={false}
          onDraftChange={onDraftChange}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Updated")).not.toBe(null);
      });
    });
  });

  describe("getGuestNotesSaveErrorMessage", () => {
    it("returns validation copy for note length failures", () => {
      const error = new ApiError("notes must be at most 1000 characters", 400, {
        message: "notes must be at most 1000 characters",
      });

      expect(getGuestNotesSaveErrorMessage(error)).toBe(
        "Notes must be 1000 characters or fewer.",
      );
    });

    it("falls back to a generic save failure message", () => {
      expect(getGuestNotesSaveErrorMessage(new Error("network"))).toBe(
        "Failed to save notes. Please try again.",
      );
    });
  });
});
