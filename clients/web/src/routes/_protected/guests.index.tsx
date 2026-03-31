import { usePostApiV1GuestsSearchHook } from "@shared/api/generated/endpoints/guests/guests";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GuestPageShell } from "../../components/guests/GuestPageShell";
import { GuestQuickListTable } from "../../components/guests/GuestQuickListTable";
import { GuestSearchBar } from "../../components/guests/GuestSearchBar";
import { useDebounce } from "../../hooks/use-debounce";

export const Route = createFileRoute("/_protected/guests/")({
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
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");

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

  return (
    <GuestPageShell title="Guests">
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
            onGuestClick={(guestId) =>
              navigate({ to: "/guests/$guestId", params: { guestId } })
            }
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
    </GuestPageShell>
  );
}
