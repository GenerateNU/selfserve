import React, { useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { Filter, Filters } from "@/components/ui/filters";
import { GuestCard } from "@/components/ui/guest-card";
import { router } from "expo-router";
import { useAPIClient } from "@shared/api/client";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import type { GuestPage } from "@shared";
import { getFloorConfig } from "./utils";

export default function GuestsList() {
  const [search, setSearch] = useState("");
  const [floors, setFloor] = useState<number[] | null>(null);

  const onFloorChange = (floor: number) => {
    if (floors?.includes(floor)) {
      setFloor(floors.filter((elem) => elem !== floor));
    } else {
      setFloor([...(floors ?? []), floor]);
    }
  };

  const handleGuestPress = (guestId: string) => {
    router.push(`/guests/${guestId}`);
  };

  const filterConfig = getFloorConfig(floors ?? [], onFloorChange);

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
    (string | number[] | null)[],
    string | undefined
  >({
    queryKey: ["guests", floors],
    queryFn: ({ pageParam }) =>
      api.post<GuestPage>("/api/v1/guests/search", {
        floors: floors ?? undefined,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const allGuests = guestData?.pages.flatMap((page) => page.data ?? []) ?? [];
  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };
  const listFooter = isFetchingNextPage ? (
    <ActivityIndicator className="py-[2vh]" />
  ) : null;

  return (
    <View className="flex-1 bg-white">
      <Header title="Guests" />
      <FlatList
        data={allGuests}
        keyExtractor={(g, index) => g.id ?? `guest-${index}`}
        renderItem={({ item }) => (
          <GuestCard
            firstName={item.first_name ?? ""}
            lastName={item.last_name ?? ""}
            floor={item.floor ?? 0}
            room={item.room_number ?? 0}
            onPress={() => {
              if (item.id) handleGuestPress(item.id);
            }}
          />
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <GuestListHeader
            search={search}
            setSearch={setSearch}
            filterConfig={filterConfig}
          />
        }
        ListFooterComponent={listFooter}
        contentContainerStyle={{ gap: 8 }}
        className="flex-1"
      />
    </View>
  );
}

interface GuestListHeaderProps<T extends number | string> {
  search: string;
  setSearch: (s: string) => void;
  filterConfig: Filter<T>[];
}

function GuestListHeader<T extends number | string>({
  search,
  setSearch,
  filterConfig,
}: GuestListHeaderProps<T>) {
  return (
    <View className="px-[4vw] pt-[2vh]">
      <SearchBar value={search} onChangeText={setSearch} />
      <Filters filters={filterConfig} className="mt-[2vh]" />
    </View>
  );
}
