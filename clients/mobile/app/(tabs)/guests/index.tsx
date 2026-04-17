import { useState } from "react";
import { FlatList, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GuestCard } from "@/components/ui/guest-card";
import { router } from "expo-router";
import { useAPIClient } from "@shared/api/client";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import type { GuestPage } from "@shared";
import { useGetRoomsFloors } from "@shared";
import { GuestListHeader } from "@/components/ui/guest-list-header";
import {
  GuestFilterSheet,
  GuestFilterState,
} from "@/components/ui/guest-filter-sheet";

export default function GuestsList() {
  const [search, setSearch] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<GuestFilterState>({
    status: [],
    requestSort: null,
    floorSort: null,
    assistance: [],
    floors: [],
  });

  const { data: floorOptions } = useGetRoomsFloors({
    query: { staleTime: Infinity },
  });

  const api = useAPIClient();
  const {
    data: guestData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    GuestPage,
    Error,
    InfiniteData<GuestPage>,
    unknown[],
    string | undefined
  >({
    queryKey: ["guests", filters, search],
    queryFn: ({ pageParam }) =>
      api.post<GuestPage>("/guests/search", {
        floors: filters.floors.length ? filters.floors : undefined,
        status: filters.status.length ? filters.status : undefined,
        assistance: filters.assistance.length ? filters.assistance : undefined,
        request_sort: filters.requestSort ?? undefined,
        floor_sort: filters.floorSort ?? undefined,
        search: search || undefined,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const allGuests = guestData?.pages.flatMap((page) => page.data ?? []) ?? [];

  const clearAll = () =>
    setFilters({
      status: [],
      requestSort: null,
      floorSort: null,
      assistance: [],
      floors: [],
    });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <FlatList
        data={allGuests}
        keyExtractor={(g, index) => g.id ?? `guest-${index}`}
        renderItem={({ item }) => (
          <GuestCard
            firstName={item.first_name ?? ""}
            lastName={item.last_name ?? ""}
            activeBookings={item.active_bookings ?? []}
            requestCount={item.request_count ?? 0}
            hasUrgent={item.has_urgent ?? false}
            assistance={item.assistance}
            onPress={() => {
              if (item.id) router.push(`/guests/${item.id}`);
            }}
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <GuestListHeader
            search={search}
            setSearch={setSearch}
            filters={filters}
            onFiltersChange={setFilters}
            onOpenFilterSheet={() => setFilterSheetOpen(true)}
          />
        }
        ListEmptyComponent={
          guestData ? (
            <Text className="text-[5vw] font-semibold text-black px-[4vw] pt-[3vh]">
              No Guests Found
            </Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator className="py-[2vh]" /> : null
        }
        contentContainerStyle={{ gap: 8 }}
        className="flex-1"
      />
      <GuestFilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        floorOptions={floorOptions ?? []}
        onShowResults={() => setFilterSheetOpen(false)}
        onClearAll={clearAll}
      />
    </SafeAreaView>
  );
}
