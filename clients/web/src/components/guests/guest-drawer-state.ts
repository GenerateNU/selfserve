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

export function clearGuestDrawerSearch<T extends GuestDrawerSearch>(
  search: T,
): T & {
  guestId: undefined;
  tab: undefined;
  activityView: undefined;
} {
  return {
    ...search,
    guestId: undefined,
    tab: undefined,
    activityView: undefined,
  };
}

export function resolveGuestDrawerTitle({
  guestId,
  activeGuestName,
  closingGuestName,
}: {
  guestId?: string;
  activeGuestName?: string;
  closingGuestName?: string;
}) {
  if (activeGuestName) return activeGuestName;
  if (!guestId && closingGuestName) return closingGuestName;
  return "Guest";
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
