import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

    // currently filtering caps guests from 5-20, instead of 5+ using this test as a placeholder for testing that
    it("shows the capped top-end group filter label", () => {
      render(
        <GuestQuickListTable
          guests={[]}
          groupFilter="all"
          floorFilter="all"
          onGroupFilterChange={() => {}}
          onFloorFilterChange={() => {}}
          onGuestClick={() => {}}
        />,
      );

      expect(
        screen.getByRole("option", {
          name: "5-20",
        }),
      ).not.toBe(null);
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
