import { useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { Header } from "@/components/ui/header";
import { GuestCard } from "@/components/ui/guest-card";
import { router } from "expo-router";
import { useAPIClient } from "@shared/api/client";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import type { GuestPage } from "@shared";
import { useGetRoomsFloors, useGetGuestBookingsGroupSizes } from "@shared";
import { GuestListHeader } from "@/components/ui/guest-list-header";
import { getFloorConfig, getGroupSizeConfig } from "@/utils";

export default function GuestsList() {
  const [search, setSearch] = useState("");
  const [floors, setFloor] = useState<number[] | null>(null);
  const [groupSizes, setGroupSize] = useState<number[] | null>(null);

  const { data: floorOptions } = useGetRoomsFloors({
    query: { staleTime: Infinity },
  });
  const { data: groupSizeOptions } = useGetGuestBookingsGroupSizes({
    query: { staleTime: Infinity },
  });

  const onFloorChange = (floor: number) => {
    if (floors?.includes(floor)) {
      setFloor(floors.filter((f) => f !== floor));
    } else {
      setFloor([...(floors ?? []), floor]);
    }
  };

  const onGroupSizeChange = (groupSize: number) => {
    if (groupSizes?.includes(groupSize)) {
      setGroupSize(groupSizes.filter((g) => g !== groupSize));
    } else {
      setGroupSize([...(groupSizes ?? []), groupSize]);
    }
  };

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
    queryKey: ["guests", floors, groupSizes, search],
    queryFn: ({ pageParam }) =>
      api.post<GuestPage>("/guests/search", {
        floors: floors ?? undefined,
        group_size: groupSizes ?? undefined,
        search: search || undefined,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const allGuests = guestData?.pages.flatMap((page) => page.data ?? []) ?? [];

  return (
    <View className="flex-1 bg-white">
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
            filterConfig={[
              ...getFloorConfig(
                floorOptions ?? [],
                floors ?? [],
                onFloorChange,
              ),
              ...getGroupSizeConfig(
                groupSizeOptions ?? [],
                groupSizes ?? [],
                onGroupSizeChange,
              ),
            ]}
            activeFloors={floors ?? []}
            activeGroupSizes={groupSizes ?? []}
            onFloorChange={onFloorChange}
            onGroupSizeChange={onGroupSizeChange}
          />
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
