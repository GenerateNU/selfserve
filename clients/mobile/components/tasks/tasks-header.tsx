import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, TextInput, View } from "react-native";

type TasksHeaderProps = {
  searchOpen: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onSearchQuery: (q: string) => void;
  onOpenFilters: () => void;
};

export function TasksHeader({
  searchOpen,
  onToggleSearch,
  searchQuery,
  onSearchQuery,
  onOpenFilters,
}: TasksHeaderProps) {
  return (
    <View className="px-[5vw] py-3">
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-bold">Tasks</Text>
        <View className="flex-row items-center gap-4">
          <Pressable onPress={onToggleSearch}>
            <Feather name="search" size={24} color="#000" />
          </Pressable>
          <Pressable onPress={onOpenFilters}>
            <Feather name="sliders" size={24} color="#000" />
          </Pressable>
          <Pressable onPress={() => {}}>
            <Feather name="bell" size={24} color="#000" />
          </Pressable>
        </View>
      </View>
      {searchOpen ? (
        <TextInput
          value={searchQuery}
          onChangeText={onSearchQuery}
          placeholder="Search loaded tasks…"
          placeholderTextColor="#9ca3af"
          className="mt-3 border border-gray-200 rounded-lg px-3 py-2 text-base bg-white"
          autoCorrect={false}
          autoCapitalize="none"
        />
      ) : null}
    </View>
  );
}
