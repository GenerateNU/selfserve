import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

interface FilterItem {
  label: string;
  value: string;
}

interface ActiveFilterChipsProps {
  filters: FilterItem[];
  onRemoveFilter?: (value: string) => void;
  onClearAll?: () => void;
}

export function ActiveFilterChips({
  filters,
  onRemoveFilter = () => {},
  onClearAll = () => {},
}: ActiveFilterChipsProps) {
  return (
    <View className="flex-row items-center gap-3 px-[5vw] py-2">
      {filters.map((filter) => (
        <View
          key={filter.value}
          className="bg-blue-600 rounded-full px-3 py-1 flex-row items-center gap-2"
        >
          <Text className="text-white text-sm">{filter.label}</Text>
          <Pressable onPress={() => onRemoveFilter(filter.value)}>
            <Feather name="x" size={14} color="white" />
          </Pressable>
        </View>
      ))}
      <Pressable onPress={onClearAll}>
        <Text className="text-gray-600 text-sm">Clear All</Text>
      </Pressable>
    </View>
  );
}
