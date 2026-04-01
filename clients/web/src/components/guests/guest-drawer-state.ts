export type GuestDrawerTab = "profile" | "activity";
export type GuestActivityView = "summary" | "history";

export type GuestDrawerSearch = {
  guestId?: string;
  tab?: string;
  activityView?: string;
};

export function resolveGuestDrawerSearch(search: GuestDrawerSearch): {
  guestId?: string;
  tab: GuestDrawerTab;
  activityView: GuestActivityView;
} {
  return {
    guestId: typeof search.guestId === "string" ? search.guestId : undefined,
    tab: search.tab === "activity" ? "activity" : "profile",
    activityView: search.activityView === "history" ? "history" : "summary",
  };
}

export function getGuestDrawerVisibility({
  guestId,
  generatedRequestOpen,
}: {
  guestId?: string;
  generatedRequestOpen: boolean;
}) {
  return Boolean(guestId) && !generatedRequestOpen;
}
