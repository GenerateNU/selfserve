import {
  MakeRequestPriority,
  useGetGuestBookingsGroupSizes,
  useGetRoomsFloors,
  usePostGuestsSearchHook,
} from "@shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GuestListHeader } from "../../components/guests/GuestListHeader";
import { GuestQuickListTable } from "../../components/guests/GuestQuickListTable";
import { useDebounce } from "../../hooks/use-debounce";
import type { Request } from "@shared";
import {
  GuestDetailsDrawer,
  GuestDrawerTab,
} from "@/components/guests/GuestDetailsDrawer";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";
import { PageShell } from "@/components/ui/PageShell";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";

export const Route = createFileRoute("/_protected/guests/")({
  validateSearch: (search: Record<string, unknown>) => ({
    guestId: typeof search.guestId === "string" ? search.guestId : undefined,
    tab:
      search.tab === GuestDrawerTab.Activity
        ? GuestDrawerTab.Activity
        : GuestDrawerTab.Profile,
  }),
  component: GuestsQuickListPage,
});

function GuestsQuickListPage() {
  const navigate = useNavigate();
  const { guestId, tab } = Route.useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [floorFilters, setFloorFilters] = useState<Array<number>>([]);
  const [groupSizeFilters, setGroupSizeFilters] = useState<Array<number>>([]);
  const [generatedData, setGeneratedData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
    guest_id?: string;
    user_id?: string;
  } | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const postGuests = usePostGuestsSearchHook();
  const { data: floorsData } = useGetRoomsFloors();
  const { data: groupSizesData } = useGetGuestBookingsGroupSizes();

  const availableFloors = floorsData ?? [];
  const availableGroupSizes = groupSizesData ?? [];

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["guests", debouncedSearch, floorFilters, groupSizeFilters],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        postGuests({
          search: debouncedSearch || undefined,
          floors: floorFilters.length > 0 ? floorFilters : undefined,
          group_size:
            groupSizeFilters.length > 0 ? groupSizeFilters : undefined,
          cursor: pageParam,
          limit: 20,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    });

  const allGuests = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const handleGuestClick = (id: string) => {
    navigate({
      to: "/guests",
      search: { guestId: id, tab: GuestDrawerTab.Profile },
    });
  };

  const handleDrawerClose = () => {
    navigate({
      to: "/guests",
      search: { guestId: undefined, tab: GuestDrawerTab.Profile },
    });
  };

  const handleTabChange = (newTab: GuestDrawerTab) => {
    if (!guestId) return;
    navigate({ to: "/guests", search: { guestId, tab: newTab } });
  };

  let guestsContent;
  if (isError) {
    guestsContent = (
      <div className="border border-black bg-white px-[1vw] py-[2vh] text-[1vw] text-black">
        Failed to load guests. Please try again.
      </div>
    );
  } else {
    guestsContent = (
      <>
        <GuestQuickListTable
          guests={allGuests}
          isLoading={isLoading}
          onGuestClick={handleGuestClick}
        />

        {isLoading && (
          <div className="px-[1vw] py-[2vh] text-[1vw] text-text-subtle">
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
    );
  }

  return (
    <PageShell
      header={{
        title: "Guests",
        description: "Description blah blah fries -> bag",
      }}
      bodyClassName="pb-24"
      drawerOpen={generatedData !== null || guestId !== undefined}
      bottomBar={generatedData === null && guestId === undefined ? (
        <GlobalTaskInput
          onRequestGenerated={(r: Request) => {
            const p = r.priority;
            setGeneratedData({
              name: r.name,
              description: r.description,
              priority:
                p && p in MakeRequestPriority
                  ? (p as MakeRequestPriority)
                  : undefined,
              room_id: r.room_id,
              guest_id: r.guest_id,
              user_id: r.user_id,
            });
          }}
        />
      ) : undefined}
      drawer={
        generatedData !== null ? (
          <CreateRequestDrawer
            initialData={generatedData}
            onClose={() => setGeneratedData(null)}
          />
        ) : guestId !== undefined ? (
          <GuestDetailsDrawer
            guestId={guestId}
            activeTab={tab}
            onTabChange={handleTabChange}
            onClose={handleDrawerClose}
          />
        ) : null
      }
    >
      <GuestListHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        availableFloors={availableFloors}
        availableGroupSizes={availableGroupSizes}
        selectedFloors={floorFilters}
        selectedGroupSizes={groupSizeFilters}
        onApplyFilters={(floors, groupSizes) => {
          setFloorFilters(floors);
          setGroupSizeFilters(groupSizes);
        }}
      />
      {guestsContent}
    </PageShell>
  );
}
