import {
  MakeRequestPriority,
  useGetGuestBookingsGroupSizes,
  useGetRoomsFloors,
} from "@shared";
import { usePostApiV1GuestsSearchHook } from "@shared/api/generated/endpoints/guests/guests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GuestQuickListTable } from "../../components/guests/GuestQuickListTable";
import { GuestSearchBar } from "../../components/guests/GuestSearchBar";
import { useDebounce } from "../../hooks/use-debounce";
import type { Request } from "@shared";
import { PageShell } from "@/components/ui/PageShell";
import { GlobalTaskInput } from "@/components/ui/GlobalTaskInput";
import { CreateRequestDrawer } from "@/components/home/CreateRequestDrawer";

export const Route = createFileRoute("/_protected/guests/")({
  component: GuestsQuickListPage,
});

function GuestsQuickListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [generatedData, setGeneratedData] = useState<{
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
  } | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const postGuests = usePostApiV1GuestsSearchHook();
  const { data: floorsData } = useGetRoomsFloors();
  const { data: groupSizesData } = useGetGuestBookingsGroupSizes();

  const availableFloors = floorsData ?? [];
  const availableGroupSizes = groupSizesData ?? [];

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["guests", debouncedSearch, floorFilter, groupFilter],
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        postGuests({
          search: debouncedSearch || undefined,
          floors: floorFilter !== "all" ? [Number(floorFilter)] : undefined,
          group_size: groupFilter !== "all" ? [Number(groupFilter)] : undefined,
          cursor: pageParam,
          limit: 20,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    });

  const allGuests = data?.pages.flatMap((page) => page.data ?? []) ?? [];

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
          floorOptions={availableFloors}
          groupSizeOptions={availableGroupSizes}
          groupFilter={groupFilter}
          floorFilter={floorFilter}
          isLoading={isLoading}
          onGroupFilterChange={setGroupFilter}
          onFloorFilterChange={setFloorFilter}
          onGuestClick={(guestId) =>
            navigate({ to: "/guests/$guestId", params: { guestId } })
          }
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
      drawerOpen={generatedData !== null}
      drawer={
        generatedData !== null ? (
          <CreateRequestDrawer
            initialData={generatedData}
            onClose={() => setGeneratedData(null)}
          />
        ) : null
      }
    >
      <GuestSearchBar value={searchTerm} onChange={setSearchTerm} />
      {guestsContent}
      {generatedData === null && (
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
            });
          }}
        />
      )}
    </PageShell>
  );
}
