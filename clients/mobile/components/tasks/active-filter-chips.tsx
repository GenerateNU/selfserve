import Feather from "@expo/vector-icons/Feather";
import { Pressable, ScrollView, Text, View } from "react-native";

<<<<<<< HEAD
export type TaskFilterChip = {
  id: string;
  label: string;
};

=======
>>>>>>> 2ae1f63 (feat: profile page (#211))
interface ActiveFilterChipsProps {
  chips: TaskFilterChip[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  chips,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (!chips.length) return null;

  return (
    <View className="px-5 py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row items-center gap-3"
      >
        {chips.map((chip) => (
          <View
            key={chip.id}
            className="bg-blue-600 rounded-full px-3 py-1 flex-row items-center gap-2"
          >
            <Text className="text-white text-sm">{chip.label}</Text>
            <Pressable onPress={() => onRemove(chip.id)} accessibilityLabel="Remove filter">
              <Feather name="x" size={14} color="white" />
            </Pressable>
          </View>
        ))}
        <Pressable onPress={onClearAll}>
          <Text className="text-gray-600 text-sm">Clear All</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
