import Feather from "@expo/vector-icons/Feather";
import { Text, View } from "react-native";

import { SectionHeader } from "./filter-section-header";

const ROOMS = ["Room 101", "Room 102", "Room 201", "Room 202", "Room 301"];

type LocationSectionProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function LocationSection({ expanded, onToggle }: LocationSectionProps) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Location"
        expanded={expanded}
        onToggle={onToggle}
        icon="map-pin"
      />
      {expanded && (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#aeaeae",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Search bar */}
          <View
            className="flex-row items-center gap-2 px-2 pt-2 pb-3"
            style={{ borderBottomWidth: 1, borderBottomColor: "#e5e9ed" }}
          >
            <View className="w-6 h-6 items-center justify-center">
              <Feather name="search" size={16} color="#464646" />
            </View>
            <Text className="text-xs font-bold text-black tracking-tight">
              Room:
            </Text>
          </View>
          {/* Room list */}
          {ROOMS.map((room) => (
            <View key={room} className="px-4 py-2">
              <Text className="text-xs text-black tracking-tight">{room}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
