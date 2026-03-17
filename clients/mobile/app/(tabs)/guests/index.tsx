<<<<<<< HEAD
import { useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
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
=======
import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { Filters } from "@/components/ui/filters";
import { GuestCard } from "@/components/ui/guest-card";
import { guestData } from "@/test-data/guests";
import { router } from "expo-router";

export default function GuestsList() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<number | null>(null);
  const [floor, setFloor] = useState<number | null>(null);

  const handleGuestPress = (guestId: number) => {
    router.push(`/guests/${guestId}`);
  };

  const filterConfig = [
    {
      value: group,
      onChange: setGroup,
      placeholder: "Group",
      emptyValue: null,
      options: [
        { label: "Group 1", value: 1 },
        { label: "Group 2", value: 2 },
        { label: "Group 3", value: 3 },
      ],
    },
    {
      value: floor,
      onChange: setFloor,
      placeholder: "Floor",
      emptyValue: null,
      options: [
        { label: "Floor 1", value: 1 },
        { label: "Floor 2", value: 2 },
        { label: "Floor 3", value: 3 },
      ],
    },
  ];

  const filteredGuests = guestData.filter((guest) => {
    const matchesSearch = guest.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGroup = group === null || guest.group === group;
    const matchesFloor = floor === null || guest.floor === floor;

    return matchesSearch && matchesGroup && matchesFloor;
>>>>>>> 9282a6e (fix: prettier formatting)
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
    <View className="flex-1 bg-white">
<<<<<<< HEAD
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
=======
      <Header title="Guests" />

      <ScrollView className="flex-1 px-[4vw] py-[2vh]">
        <SearchBar value={search} onChangeText={setSearch} />

        <Filters filters={filterConfig} className="mt-[2vh]" />

        <View className="mt-[2vh] gap-[1vh]">
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              name={guest.name}
              floor={guest.floor}
              room={guest.room}
              group={guest.group}
              onPress={() => handleGuestPress(guest.id)}
            />
          ))}
        </View>
      </ScrollView>
>>>>>>> 9282a6e (fix: prettier formatting)
    </View>
  );
}
