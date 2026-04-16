import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useGetNotifications,
  useMarkAllNotificationsRead,
} from "@shared/api/notifications";
import type { Notification } from "@shared/types/notifications";
import { NotificationItem } from "@/components/notifications/notification-item";
import { ScreenHeader } from "@/components/ui/screen-header";

export default function NotificationsScreen() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = useMemo(
    () => data?.pages.flat() ?? [],
    [data],
  );

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
      <ScreenHeader title="Notifications" />

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
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator />
              </View>
            ) : null
          }
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
