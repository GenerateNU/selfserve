import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useGetNotifications } from "@shared/api/notifications";

export function TasksHeader() {
  const router = useRouter();
  const { data: notifications } = useGetNotifications();
  const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0;

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
        <Pressable onPress={() => router.push("/notifications")} className="relative">
          <Feather name="bell" size={24} color="#000" />
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 size-4 rounded-full bg-primary items-center justify-center">
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
