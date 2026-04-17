import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { RoomCard, type RoomStatus } from "@/components/rooms/room-card";
import { FloorPickerSheet } from "@/components/rooms/floor-picker-sheet";
import {
  RoomFilterSheet,
  type RoomFilters,
  EMPTY_ROOM_FILTERS,
  STATUS_OPTIONS,
  ATTRIBUTE_OPTIONS,
  ADVANCED_OPTIONS,
} from "@/components/rooms/room-filter-sheet";
import {
  RoomSortSheet,
  type RoomSort,
  DEFAULT_ROOM_SORT,
} from "@/components/rooms/room-sort-sheet";
import { useGetRooms, useGetRoomsFloors, BookingStatus, RoomStatusValue } from "@shared/api/rooms";
import type { RoomWithOptionalGuestBooking } from "@shared";

function getRoomStatus(room: RoomWithOptionalGuestBooking): RoomStatus {
  switch (true) {
    case room.room_status === RoomStatusValue.OutOfOrder:
      return { type: "out-of-order" };
    case room.booking_status === BookingStatus.BookingStatusActive: {
      const guest = room.guests?.[0];
      const guestName =
        [guest?.first_name, guest?.last_name].filter(Boolean).join(" ") ||
        "Guest";
      return { type: "occupied", guestName };
    }
    default:
      return {
        type: "vacant",
        isAvailable: room.room_status === RoomStatusValue.Available,
      };
  }
}

function getFloorLabel(selectedFloors: number[]): string {
  if (selectedFloors.length === 0) return "All Floors";
  if (selectedFloors.length === 1) return `Floor ${selectedFloors[0]}`;
  return `${selectedFloors.length} Floors`;
}

export default function RoomsScreen() {
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [floorPickerVisible, setFloorPickerVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>(EMPTY_ROOM_FILTERS);
  const [sort, setSort] = useState<RoomSort>(DEFAULT_ROOM_SORT);

  const { data: floors = [] } = useGetRoomsFloors();

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.attributes.length > 0 ||
    filters.advanced.length > 0;

  const { data: roomsData } = useGetRooms({
    floors: selectedFloors.length ? selectedFloors : undefined,
    status: filters.status.length ? filters.status : undefined,
    attributes: filters.attributes.length ? filters.attributes : undefined,
    advanced: filters.advanced.length ? filters.advanced : undefined,
    sort: sort !== "ascending" ? sort : undefined,
  });
  const rooms = roomsData?.items ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Top app bar */}
      <View className="flex-row items-center justify-between px-[22px] pb-2 pt-3">
        <Pressable
          className="flex-row items-center gap-[10px]"
          onPress={() => setFloorPickerVisible(true)}
        >
          <Text className="text-2xl font-medium text-text-default tracking-tight">
            {getFloorLabel(selectedFloors)}
          </Text>
          <ChevronDown size={14} color={Colors.light.textDefault} />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Pressable className="items-center justify-center rounded w-[34px] h-[34px]">
            <Search size={19} color={Colors.light.textDefault} />
          </Pressable>
          <Pressable
            className={`items-center justify-center rounded w-[34px] h-[34px] ${filterVisible ? "bg-bg-selected" : ""}`}
            onPress={() => setFilterVisible(true)}
          >
            <SlidersHorizontal
              size={19}
              color={filterVisible ? Colors.light.tabBarActive : Colors.light.textDefault}
            />
            {hasActiveFilters && (
              <View className="absolute top-[5px] right-[5px] w-[6px] h-[6px] rounded-full bg-primary" />
            )}
          </Pressable>
          <Pressable
            className={`items-center justify-center rounded w-[34px] h-[34px] ${sortVisible ? "bg-bg-selected" : ""}`}
            onPress={() => setSortVisible(true)}
          >
            <ArrowUpDown
              size={18}
              color={sortVisible ? Colors.light.tabBarActive : Colors.light.textDefault}
            />
          </Pressable>
        </View>
      </View>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <View className="flex-row flex-wrap gap-2 items-center px-6 py-4 border-b border-stroke-subtle">
          {[
            ...filters.status.map((v) => ({
              label: STATUS_OPTIONS.find((o) => o.value === v)!.label,
              onRemove: () =>
                setFilters((f) => ({ ...f, status: f.status.filter((s) => s !== v) })),
            })),
            ...filters.attributes.map((v) => ({
              label: ATTRIBUTE_OPTIONS.find((o) => o.value === v)!.label,
              onRemove: () =>
                setFilters((f) => ({ ...f, attributes: f.attributes.filter((a) => a !== v) })),
            })),
            ...filters.advanced.map((v) => ({
              label: ADVANCED_OPTIONS.find((o) => o.value === v)!.label,
              onRemove: () =>
                setFilters((f) => ({ ...f, advanced: f.advanced.filter((a) => a !== v) })),
            })),
          ].map(({ label, onRemove }) => (
            <Pressable
              key={label}
              onPress={onRemove}
              className="flex-row items-center gap-2 bg-bg-selected px-3 py-1.5 rounded"
            >
              <Text className="text-[13px] text-primary">{label}</Text>
              <X size={9} color={Colors.light.tabBarActive} />
            </Pressable>
          ))}
          <Pressable onPress={() => setFilters(EMPTY_ROOM_FILTERS)}>
            <Text className="text-[12px] text-text-subtle">Clear All</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id ?? String(item.room_number)}
        renderItem={({ item }) => (
          <RoomCard
            roomNumber={item.room_number ?? ""}
            roomType={item.suite_type ?? ""}
            status={getRoomStatus(item)}
            onPress={() => {
              const guestIds =
                item.booking_status === BookingStatus.BookingStatusActive
                  ? (item.guests
                      ?.map((g) => g.id)
                      .filter(Boolean)
                      .join(",") ?? "")
                  : "";
              router.push(
                `/explore/${item.id}?roomNumber=${item.room_number}&guestIds=${guestIds}`,
              );
            }}
          />
        )}
      />
      <FloorPickerSheet
        visible={floorPickerVisible}
        floors={floors}
        selectedFloors={selectedFloors}
        onApply={setSelectedFloors}
        onClose={() => setFloorPickerVisible(false)}
      />
      <RoomFilterSheet
        visible={filterVisible}
        filters={filters}
        onApply={setFilters}
        onClose={() => setFilterVisible(false)}
      />
      <RoomSortSheet
        visible={sortVisible}
        sort={sort}
        onSelect={setSort}
        onClose={() => setSortVisible(false)}
      />
    </SafeAreaView>
  );
}
