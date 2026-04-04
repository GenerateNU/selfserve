import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { selectSingleFilterValue } from "../components/guests/GuestFilterPopover";
import { GuestDetailsDrawer } from "../components/guests/GuestDetailsDrawer";
import { GuestQuickListTable } from "../components/guests/GuestQuickListTable";
import { PageShell } from "../components/ui/PageShell";
import {
  clearGuestDrawerSearch,
  getGuestDrawerVisibility,
  resolveGuestDrawerSearch,
  resolveGuestDrawerTitle,
} from "../components/guests/guest-drawer-state";
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
        <GuestQuickListTable guests={[]} isLoading onGuestClick={() => {}} />,
      );

      expect(screen.queryByText("No guests match your current filters.")).toBe(
        null,
      );
    });

    it("shows the specific assistance placeholder column", () => {
      render(
        <GuestQuickListTable
          guests={[
            {
              id: "guest-1",
              first_name: "Xinning",
              last_name: "Liu",
              preferred_name: "Lucy",
              floor: 3,
              room_number: 300,
              group_size: 5,
            },
          ]}
          onGuestClick={() => {}}
        />,
      );

      expect(screen.getByText("Specific Assistance")).not.toBeNull();
    });

    it("renders grouped table headings for guest, active bookings, and specific assistance", () => {
      render(<GuestQuickListTable guests={[]} onGuestClick={() => {}} />);

      expect(screen.getByText("Guest")).not.toBeNull();
      expect(screen.getByText("Active Bookings")).not.toBeNull();
      expect(screen.getByText("Group Size")).not.toBeNull();
      expect(screen.getByText("Specific Assistance")).not.toBeNull();
    });

    it("renders guest rows as separate government, preferred, suite, and group cells", () => {
      render(
        <GuestQuickListTable
          guests={[
            {
              id: "guest-1",
              first_name: "Xinning Lucy",
              last_name: "Liu",
              preferred_name: "Lucy",
              floor: 3,
              room_number: 300,
              group_size: 5,
            },
          ]}
          onGuestClick={() => {}}
        />,
      );

      expect(screen.getByText("Xinning Lucy Liu")).not.toBeNull();
      expect(screen.getByText("(Lucy)")).not.toBeNull();
      expect(screen.getByText("Suite 300")).not.toBeNull();
      expect(screen.getByText("Floor 3")).not.toBeNull();
      expect(
        screen.getByText((content) => content.trim() === "5"),
      ).not.toBeNull();
    });

    it("falls back to the first name when preferred name is missing", () => {
      render(
        <GuestQuickListTable
          guests={[
            {
              id: "guest-2",
              first_name: "Jane",
              last_name: "Doe",
              preferred_name: "",
              floor: 2,
              room_number: 204,
              group_size: 2,
            },
          ]}
          isLoading={false}
          onGuestClick={() => {}}
        />,
      );

      expect(screen.getByText("(Jane)")).not.toBeNull();
    });
  });

  describe("guest drawer state", () => {
    it("normalizes guest drawer search params with safe defaults", () => {
      expect(
        resolveGuestDrawerSearch({
          guestId: "guest-123",
          tab: "unknown",
          activityView: "unknown",
        }),
      ).toEqual({
        guestId: "guest-123",
        tab: "profile",
        activityView: "summary",
      });
    });

    it("hides the guest drawer when the generated request drawer is open", () => {
      expect(
        getGuestDrawerVisibility({
          guestId: "guest-123",
          generatedRequestOpen: true,
        }),
      ).toBe(false);
    });

    it("clears guest drawer query params when a generated request takes over", () => {
      expect(
        clearGuestDrawerSearch({
          guestId: "guest-123",
          tab: "activity",
          activityView: "history",
          unrelated: "keep-me",
        }),
      ).toEqual({
        guestId: undefined,
        tab: undefined,
        activityView: undefined,
        unrelated: "keep-me",
      });
    });

    it("keeps the last resolved guest name during drawer close", () => {
      expect(
        resolveGuestDrawerTitle({
          guestId: undefined,
          activeGuestName: undefined,
          closingGuestName: "Lucy Liu",
        }),
      ).toBe("Lucy Liu");
    });

    it("does not reuse the previous guest name while a new guest is loading", () => {
      expect(
        resolveGuestDrawerTitle({
          guestId: "guest-456",
          activeGuestName: undefined,
          closingGuestName: "Lucy Liu",
        }),
      ).toBe("Guest");
    });
  });

  describe("GuestFilterPopover", () => {
    it("keeps floor and group size selection single-select", () => {
      expect(selectSingleFilterValue([], 1)).toEqual([1]);
      expect(selectSingleFilterValue([1], 3)).toEqual([3]);
      expect(selectSingleFilterValue([3], 3)).toEqual([]);
      expect(selectSingleFilterValue(["1-2"], "5+")).toEqual(["5+"]);
    });
  });

  describe("PageShell", () => {
    it("renders a transparent dismissible overlay when the drawer is open", () => {
      let closeCount = 0;

      render(
        <PageShell
          header={<div>Header</div>}
          drawerOpen
          onDrawerClose={() => {
            closeCount += 1;
          }}
          drawer={<div>Drawer content</div>}
        >
          <div>Page content</div>
        </PageShell>,
      );

      const overlay = screen.getByLabelText("Close drawer overlay");
      fireEvent.click(overlay);

      expect(closeCount).toBe(1);
      expect(overlay.className).toContain("bg-transparent");
    });

    it("stacks the dismiss overlay above floating page controls and below the drawer", () => {
      const { container } = render(
        <PageShell
          header={<div>Header</div>}
          drawerOpen
          onDrawerClose={() => {}}
          drawer={<div>Drawer content</div>}
        >
          <div className="fixed z-50">Floating page control</div>
        </PageShell>,
      );

      const overlay = screen.getByLabelText("Close drawer overlay");
      const drawer = container.querySelector("aside");

      expect(overlay.className).toContain("z-60");
      expect(drawer?.className).toContain("z-70");
    });
  });

  describe("GuestDetailsDrawer", () => {
    it("switches tabs through the provided callbacks", () => {
      let activeTab: "profile" | "activity" = "profile";

      const { rerender } = render(
        <GuestDetailsDrawer
          guestName="Lucy L."
          activeTab={activeTab}
          onChangeTab={(nextTab) => {
            activeTab = nextTab;
          }}
          onClose={() => {}}
        >
          <div>Drawer body</div>
        </GuestDetailsDrawer>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Visit Activity" }));

      rerender(
        <GuestDetailsDrawer
          guestName="Lucy L."
          activeTab={activeTab}
          onChangeTab={(nextTab) => {
            activeTab = nextTab;
          }}
          onClose={() => {}}
        >
          <div>Drawer body</div>
        </GuestDetailsDrawer>,
      );

      expect(
        screen
          .getByRole("button", { name: "Visit Activity" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
    });
  });
});
