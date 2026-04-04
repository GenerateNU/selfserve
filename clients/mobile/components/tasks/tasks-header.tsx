import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

type TasksHeaderProps = {
  onOpenFilters: () => void;
  onToggleSearch: () => void;
  onOpenNotifications: () => void;
  searchActive: boolean;
};

export function TasksHeader({
  onOpenFilters,
  onToggleSearch,
  onOpenNotifications,
  searchActive,
}: TasksHeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-5 py-3">
      <Text className="text-2xl font-bold">Tasks</Text>
      <View className="flex-row items-center gap-4">
        <Pressable onPress={onToggleSearch} accessibilityLabel="Toggle search">
          <Feather
            name="search"
            size={24}
            color={searchActive ? "#004FC5" : "#000"}
          />
        </Pressable>
        <Pressable onPress={onOpenFilters} accessibilityLabel="Open filters">
          <Feather name="sliders" size={24} color="#000" />
        </Pressable>
        <Pressable
          onPress={onOpenNotifications}
          accessibilityLabel="Open notifications"
        >
          <Feather name="bell" size={24} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}
