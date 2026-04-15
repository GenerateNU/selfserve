import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

type TasksHeaderProps = {
  onFilterPress?: () => void;
};

export function TasksHeader({ onFilterPress }: TasksHeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-[22px] pt-3 pb-2">
      <Text className="text-2xl font-medium tracking-tight text-black">
        Tasks
      </Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => {}}
          className="w-[34px] h-[34px] items-center justify-center rounded"
        >
          <Feather name="search" size={19} color="#000" />
        </Pressable>
        <Pressable
          onPress={onFilterPress}
          className="w-[34px] h-[34px] items-center justify-center rounded"
        >
          <Feather name="sliders" size={19} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}
