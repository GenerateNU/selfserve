import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GuestWithBooking } from "@shared";
import { GuestProfilePageSkeleton } from "../components/guests/GuestProfilePageSkeleton";
import { GuestQuickListTable } from "../components/guests/GuestQuickListTable";
import { formatDate } from "../utils/dates";

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

  describe("GuestProfilePageSkeleton", () => {
    it("renders multiple skeleton placeholders for the profile page", () => {
      const { container } = render(<GuestProfilePageSkeleton />);

      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(
        11,
      );
    });
  });
});
