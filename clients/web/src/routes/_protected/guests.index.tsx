import { usePostApiV1GuestsSearchHook } from "@shared/api/generated/endpoints/guests/guests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GuestQuickListTable } from "../../components/guests/GuestQuickListTable";
import { GuestSearchBar } from "../../components/guests/GuestSearchBar";
import { useDebounce } from "../../hooks/use-debounce";
import type { Request } from "@shared";
import { GeneratedRequestDrawer } from "@/components/requests/GeneratedRequestDrawer";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { PageShell } from "@/components/ui/PageShell";
import { GuestDetailsDrawer } from "@/components/guests/GuestDetailsDrawer";
import {
  getGuestDrawerVisibility,
  resolveGuestDrawerSearch,
} from "@/components/guests/guest-drawer-state";

export const Route = createFileRoute("/_protected/guests/")({
  validateSearch: (search: Record<string, unknown>) => search,
  component: GuestsQuickListPage,
});

function groupSizeFilter(filter: string): Array<number> | undefined {
  if (filter === "1-2") return [1, 2];
  if (filter === "3-4") return [3, 4];
  // Product decision: the largest group filter bucket is capped at 20.
  if (filter === "5+")
    return [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  return undefined;
}

function GuestsQuickListPage() {
  const navigate = useNavigate();
  const resolvedSearch = resolveGuestDrawerSearch(Route.useSearch());
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [generatedRequest, setGeneratedRequest] = useState<Request | null>(
    null,
  );

  const debouncedSearch = useDebounce(searchTerm, 300);
  const postGuests = usePostApiV1GuestsSearchHook();

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["guests", debouncedSearch, floorFilter, groupFilter],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        postGuests({
          search: debouncedSearch || undefined,
          floors: floorFilter !== "all" ? [Number(floorFilter)] : undefined,
          group_size: groupSizeFilter(groupFilter),
          cursor: pageParam,
          limit: 20,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    });

  const allGuests = data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const guestDrawerOpen = getGuestDrawerVisibility({
    guestId: resolvedSearch.guestId,
    generatedRequestOpen: generatedRequest !== null,
  });
  const anyDrawerOpen = generatedRequest !== null || guestDrawerOpen;
  const selectedGuest = allGuests.find(
    (guest) => guest.id === resolvedSearch.guestId,
  );

  const closeGuestDrawer = () => {
    navigate({
      to: "/guests",
      search: (prev) => ({
        ...prev,
        guestId: undefined,
        tab: undefined,
        activityView: undefined,
      }),
      replace: true,
    });
  };

  const closeAnyDrawer = () => {
    if (generatedRequest !== null) {
      setGeneratedRequest(null);
      return;
    }

    closeGuestDrawer();
  };

  const drawer = generatedRequest ? (
    <GeneratedRequestDrawer
      request={generatedRequest}
      onClose={() => setGeneratedRequest(null)}
    />
  ) : (
    <GuestDetailsDrawer
      guestName={
        selectedGuest
          ? `${selectedGuest.first_name} ${selectedGuest.last_name}`
          : "Guest"
      }
      activeTab={resolvedSearch.tab}
      onChangeTab={(tab) =>
        navigate({
          to: "/guests",
          search: (prev) => ({
            ...prev,
            guestId: resolvedSearch.guestId,
            tab,
            activityView:
              tab === "activity"
                ? resolveGuestDrawerSearch(prev).activityView
                : undefined,
          }),
          replace: true,
        })
      }
      onClose={closeGuestDrawer}
    >
      {guestDrawerOpen ? (
        <div className="text-sm text-text-subtle">
          Guest drawer content will be added in the next milestone.
        </div>
      ) : null}
    </GuestDetailsDrawer>
  );

  return (
    <PageShell
      header={
        <div className="px-6 py-5 border-b border-stroke-subtle">
          <h1 className="text-2xl font-semibold text-text-default">Guests</h1>
        </div>
      }
      drawerOpen={anyDrawerOpen}
      onDrawerClose={closeAnyDrawer}
      drawer={drawer}
    >
      <GuestSearchBar value={searchTerm} onChange={setSearchTerm} />

      {isError ? (
        <div className="border border-black bg-white px-[1vw] py-[2vh] text-[1vw] text-black">
          Failed to load guests. Please try again.
        </div>
      ) : (
        <>
          <GuestQuickListTable
            guests={allGuests}
            groupFilter={groupFilter}
            floorFilter={floorFilter}
            isLoading={isLoading}
            onGroupFilterChange={setGroupFilter}
            onFloorFilterChange={setFloorFilter}
            onGuestClick={(guestId) => {
              setGeneratedRequest(null);
              navigate({
                to: "/guests",
                search: (prev) => ({
                  ...prev,
                  guestId,
                  tab: "profile",
                  activityView: undefined,
                }),
              });
            }}
          />

          {isLoading && (
            <div className="px-[1vw] py-[2vh] text-[1vw] text-neutral-600">
              Loading guests...
            </div>
          )}

          {hasNextPage && !isLoading && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetching}
              className="mt-[1vh] w-full border border-black bg-white py-[1vh] text-[1vw] text-black hover:bg-neutral-50 disabled:opacity-50"
            >
              {isFetching ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}

      {!anyDrawerOpen && (
        <GlobalTaskInput onRequestGenerated={setGeneratedRequest} />
      )}
    </PageShell>
  );
}
