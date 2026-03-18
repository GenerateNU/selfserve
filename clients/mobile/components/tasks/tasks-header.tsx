import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

export function TasksHeader() {
  return (
    <View className="flex-row justify-between items-center px-[5vw] py-3">
      <Text className="text-2xl font-bold">Tasks</Text>
      <View className="flex-row items-center gap-4">
        <Pressable onPress={() => {}}>
          <Feather name="search" size={24} color="#000" />
        </Pressable>
        <Pressable onPress={() => {}}>
          <Feather name="sliders" size={24} color="#000" />
        </Pressable>
        <Pressable onPress={() => {}}>
          <Feather name="bell" size={24} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}
