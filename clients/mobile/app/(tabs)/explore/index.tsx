import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { RoomCard, type RoomStatus } from "@/components/rooms/room-card";
import {
  FloorPickerSheet,
  type Floor,
} from "@/components/rooms/floor-picker-sheet";
import {
  RoomFilterSheet,
  type RoomFilters,
  EMPTY_ROOM_FILTERS,
} from "@/components/rooms/room-filter-sheet";
import {
  RoomSortSheet,
  type RoomSort,
  DEFAULT_ROOM_SORT,
} from "@/components/rooms/room-sort-sheet";
import { OverviewTab } from "@/components/rooms/overview-tab";
import {
  useGetRoomsForFloor,
  BookingStatus,
  RoomStatusValue,
} from "@shared/api/rooms";
import type { RoomWithOptionalGuestBooking } from "@shared";

const FLOORS: Floor[] = [
  { id: "1", label: "Floor 1" },
  { id: "2", label: "Floor 2" },
  { id: "3", label: "Floor 3" },
  { id: "4", label: "Floor 4" },
  { id: "5", label: "Floor 5" },
];

type TabId = "rooms" | "overview";

const TABS: { id: TabId; label: string }[] = [
  { id: "rooms", label: "Rooms" },
  { id: "overview", label: "Overview" },
];

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

export default function RoomsScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("rooms");
  const [selectedFloor, setSelectedFloor] = useState<Floor>(FLOORS[0]);
  const [floorPickerVisible, setFloorPickerVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>(EMPTY_ROOM_FILTERS);
  const [sort, setSort] = useState<RoomSort>(DEFAULT_ROOM_SORT);

  const floorId = parseInt(selectedFloor.id);
  const { data: roomsData } = useGetRoomsForFloor([floorId]);
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
            {selectedFloor.label}
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
              color={
                filterVisible
                  ? Colors.light.tabBarActive
                  : Colors.light.textDefault
              }
            />
          </Pressable>
          <Pressable
            className={`items-center justify-center rounded w-[34px] h-[34px] ${sortVisible ? "bg-bg-selected" : ""}`}
            onPress={() => setSortVisible(true)}
          >
            <ArrowUpDown
              size={18}
              color={
                sortVisible
                  ? Colors.light.tabBarActive
                  : Colors.light.textDefault
              }
            />
          </Pressable>
        </View>
      </View>

      {/* Tab selector */}
      <View className="flex-row border-b border-stroke-subtle">
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            className={`flex-1 flex-row items-center justify-center gap-1 h-10 px-3 ${
              activeTab === tab.id ? "border-b-2 border-primary" : ""
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              className={`text-[15px] ${
                activeTab === tab.id ? "text-primary" : "text-text-secondary"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === "rooms" ? (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id ?? String(item.room_number)}
          renderItem={({ item }) => (
            <RoomCard
              roomNumber={item.room_number ?? ""}
              roomType={item.suite_type ?? ""}
              status={getRoomStatus(item)}
              onPress={() =>
                router.push(
                  `/explore/${item.id}?roomNumber=${item.room_number}`,
                )
              }
            />
          )}
        />
      ) : (
        <OverviewTab floorId={floorId} />
      )}
      <FloorPickerSheet
        visible={floorPickerVisible}
        floors={FLOORS}
        selectedFloorId={selectedFloor.id}
        onSelect={setSelectedFloor}
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
