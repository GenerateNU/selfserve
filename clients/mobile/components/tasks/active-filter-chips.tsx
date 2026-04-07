import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

export type ActiveFilterChip = {
  field: "department" | "priority" | "status";
  label: string;
};

interface ActiveFilterChipsProps {
  filters: ActiveFilterChip[];
  onRemoveFilter: (field: ActiveFilterChip["field"]) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  return (
    <View className="flex-row items-center gap-3 px-5 py-2">
      {filters.map((filter) => (
        <View
          key={`${filter.field}-${filter.label}`}
          className="bg-blue-600 rounded-full px-3 py-1 flex-row items-center gap-2"
        >
          <Text className="text-white text-sm">{filter.label}</Text>
          <Pressable onPress={() => onRemoveFilter(filter.field)}>
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
