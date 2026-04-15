import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useGetNotifications } from "@shared/api/notifications";

export function TasksHeader() {
  const router = useRouter();
  const { data: notifications } = useGetNotifications();
  const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0;

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
        <Pressable
          onPress={() => router.push("/notifications")}
          className="w-[34px] h-[34px] items-center justify-center rounded relative"
        >
          <Feather name="bell" size={19} color="#000" />
          {unreadCount > 0 && (
            <View className="absolute top-0 right-0 size-4 rounded-full bg-primary items-center justify-center">
              <Text className="text-white text-[10px] font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
