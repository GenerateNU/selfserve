import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ChevronDown, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { RoomCard, type RoomStatus } from "@/components/rooms/room-card";
import { FloorPickerSheet, type Floor } from "@/components/rooms/floor-picker-sheet";

type Room = {
  id: string;
  roomNumber: number;
  roomType: string;
  status: RoomStatus;
  hasHighPriority?: boolean;
  isAccessible?: boolean;
  extraTagCount?: number;
};

const MOCK_ROOMS: Room[] = [
  {
    id: "1",
    roomNumber: 100,
    roomType: "Double Suite",
    status: { type: "occupied", guestName: "John Doe" },
    hasHighPriority: true,
    isAccessible: true,
    extraTagCount: 1,
  },
  {
    id: "2",
    roomNumber: 101,
    roomType: "Double Suite",
    status: { type: "out-of-order" },
    hasHighPriority: true,
    isAccessible: true,
    extraTagCount: 1,
  },
  {
    id: "3",
    roomNumber: 102,
    roomType: "Double Suite",
    status: { type: "vacant", isAvailable: true },
    isAccessible: true,
  },
  {
    id: "4",
    roomNumber: 103,
    roomType: "Double Suite",
    status: { type: "occupied", guestName: "Jane Smith" },
    hasHighPriority: true,
    isAccessible: true,
    extraTagCount: 1,
  },
  {
    id: "5",
    roomNumber: 104,
    roomType: "King Suite",
    status: { type: "occupied", guestName: "Robert Chen" },
    hasHighPriority: true,
    isAccessible: true,
    extraTagCount: 1,
  },
  {
    id: "6",
    roomNumber: 105,
    roomType: "Double Suite",
    status: { type: "vacant", isAvailable: false },
  },
];

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

export default function RoomsScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("rooms");
  const [selectedFloor, setSelectedFloor] = useState<Floor>(FLOORS[0]);
  const [floorPickerVisible, setFloorPickerVisible] = useState(false);

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
          <Pressable className="items-center justify-center rounded w-[34px] h-[34px]">
            <SlidersHorizontal size={19} color={Colors.light.textDefault} />
          </Pressable>
          <Pressable className="items-center justify-center rounded w-[34px] h-[34px]">
            <ArrowUpDown size={18} color={Colors.light.textDefault} />
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
          data={MOCK_ROOMS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard
              roomNumber={item.roomNumber}
              roomType={item.roomType}
              status={item.status}
              hasHighPriority={item.hasHighPriority}
              isAccessible={item.isAccessible}
              extraTagCount={item.extraTagCount}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-subtle">Overview coming soon</Text>
        </View>
      )}
      <FloorPickerSheet
        visible={floorPickerVisible}
        floors={FLOORS}
        selectedFloorId={selectedFloor.id}
        onSelect={setSelectedFloor}
        onClose={() => setFloorPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
