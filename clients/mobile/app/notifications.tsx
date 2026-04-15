import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

import {
  useGetNotifications,
  useMarkAllNotificationsRead,
} from "@shared/api/notifications";
import type { Notification } from "@shared/types/notifications";
import { NotificationItem } from "@/components/notifications/notification-item";

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications = [], isLoading } = useGetNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  // Snapshot which IDs were unread when the screen first loaded so dots remain
  // visible while user is reading — markAllRead fires immediately in the bg.
  const initialUnreadIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (notifications.length > 0 && initialUnreadIds.current === null) {
      initialUnreadIds.current = new Set(
        notifications.filter((n) => !n.read_at).map((n) => n.id),
      );
      markAllRead();
    }
  }, [notifications, markAllRead]);

  return (
    <SafeAreaView className="flex-1 bg-bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-2.5 px-[22px] pt-3 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="chevron-left" size={20} color="#000" />
        </Pressable>
        <Text className="flex-1 text-2xl font-medium text-text-default tracking-tight">
          Notifications
        </Text>
      </View>

      <View className="border-b border-[#E5E9ED]" />

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList<Notification>
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              showUnreadDot={
                initialUnreadIds.current?.has(item.id) ?? !item.read_at
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="pt-20 items-center">
              <Text className="text-[15px] text-text-subtle">
                No notifications
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
