import React, { useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { Header } from "@/components/ui/header";
import { SearchBar } from "@/components/ui/search-bar";
import { Filters } from "@/components/ui/filters";
import { GuestCard } from "@/components/ui/guest-card";
import { router } from "expo-router";
import { useAPIClient } from "@shared/api/client";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { GuestPage } from "@shared/api/generated/models/guestPage";

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

  const filterConfig = [
    {
      value: floors,
      onChange: onFloorChange,
      placeholder: "Floor",
      options: [
        { label: "Floor 1", value: 1 },
        { label: "Floor 2", value: 2 },
        { label: "Floor 3", value: 3 },
        { label: "Floor 4", value: 4 },
        { label: "Floor 5", value: 5 },
        { label: "Floor 6", value: 6 },
        { label: "Floor 7", value: 7 },
        { label: "Floor 8", value: 8 },
        { label: "Floor 9", value: 9 },
      ],
    },
  ];

  const api = useAPIClient();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<
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

  const allGuests = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return (
    <View className="flex-1 bg-white">
      <Header title="Guests" />
      <FlatList
        data={allGuests}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <GuestCard
            firstName={item.first_name}
            lastName={item.last_name}
            floor={item.floor}
            room={item.room_number}
            onPress={() => handleGuestPress(item.id)}
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View className="px-[4vw] pt-[2vh]">
            <SearchBar value={search} onChangeText={setSearch} />
            <Filters filters={filterConfig} className="mt-[2vh]" />
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator className="py-[2vh]" /> : null
        }
        contentContainerStyle={{ gap: 8 }}
        className="flex-1"
      />
    </View>
  );
}
