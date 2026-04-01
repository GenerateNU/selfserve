import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuestDetailsDrawer } from "../components/guests/GuestDetailsDrawer";
import { GuestQuickListTable } from "../components/guests/GuestQuickListTable";
import { PageShell } from "../components/ui/PageShell";
import {
  getGuestDrawerVisibility,
  resolveGuestDrawerSearch,
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
        screen.getByRole("button", { name: "Visit Activity" }).getAttribute(
          "aria-pressed",
        ),
      ).toBe("true");
    });
  });
});
