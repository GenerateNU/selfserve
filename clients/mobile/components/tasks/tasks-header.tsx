import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, TextInput, View } from "react-native";

import { Colors } from "@/constants/theme";

type TasksHeaderProps = {
  onFilterPress?: () => void;
  filterActive?: boolean;
  searchOpen: boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export function TasksHeader({
  onFilterPress,
  filterActive,
  searchOpen,
  onSearchOpen,
  onSearchClose,
  search,
  onSearchChange,
}: TasksHeaderProps) {
  if (searchOpen) {
    return (
      <View className="flex-row items-center px-5 py-5 gap-2">
        <View className="flex-1 flex-row items-center border border-stroke-subtle rounded-xl px-3 h-10 gap-2">
          <Feather name="search" size={16} color={Colors.light.placeholder} />
          <TextInput
            autoFocus
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search"
            placeholderTextColor={Colors.light.placeholder}
            className="flex-1 text-sm text-text-default"
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={onSearchClose}
          className="w-9 h-9 items-center justify-center rounded"
        >
          <Feather name="x" size={19} color={Colors.light.textDefault} />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-row justify-between items-center px-5 py-5">
      <Text className="text-2xl font-medium tracking-tight text-text-default">
        Tasks
      </Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onSearchOpen}
          className="w-9 h-9 items-center justify-center rounded"
        >
          <Feather name="search" size={19} color={Colors.light.textDefault} />
        </Pressable>
        <Pressable
          onPress={onFilterPress}
          className={`w-9 h-9 items-center justify-center rounded${filterActive ? " bg-bg-selected" : ""}`}
        >
          <Feather
            name="sliders"
            size={19}
            color={
              filterActive
                ? Colors.light.tabBarActive
                : Colors.light.textDefault
            }
          />
        </Pressable>
      </View>
    </View>
  );
}
