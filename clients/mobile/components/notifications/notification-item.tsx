import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { Notification } from "@shared/types/notifications";
import { NotificationType } from "@shared/types/notifications";

const PRIMARY = "#15502c";
const PRIORITY_HIGH = "#a21313";

function formatTimestamp(iso: string, showUnreadDot: boolean): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (showUnreadDot) {
    if (diffMins < 60) return `Added ${diffMins}m ago`;
    if (diffHours < 24) return `Added ${diffHours}h ago`;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDueTime(dueAt?: unknown): string | null {
  if (typeof dueAt !== "string") return null;
  const due = new Date(dueAt);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  if (diffMs <= 0) return "Overdue";
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffMins = Math.floor((diffMs % 3_600_000) / 60_000);
  if (diffHours >= 1)
    return `Due in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  return `Due in ${diffMins}m`;
}

function NewTasksBadge() {
  return (
    <View className="bg-bg-selected flex-row items-center gap-1.5 h-6 px-2 py-1 rounded">
      <Feather name="check-square" size={12} color={PRIMARY} />
      <Text className="text-[12px] text-primary tracking-tight">new tasks</Text>
    </View>
  );
}

function UrgentTaskBadge() {
  return (
    <View className="bg-bg-selected flex-row items-center gap-1.5 h-6 px-2 py-1 rounded">
      <Feather name="alert-circle" size={12} color={PRIMARY} />
      <Text className="text-[12px] text-primary tracking-tight">
        urgent task
      </Text>
    </View>
  );
}

type NotificationItemProps = {
  notification: Notification;
  showUnreadDot: boolean;
};

export function NotificationItem({
  notification,
  showUnreadDot,
}: NotificationItemProps) {
  const router = useRouter();
  const isUrgent = notification.type === NotificationType.HighPriorityTask;

  const taskId =
    notification.data && typeof notification.data === "object"
      ? (notification.data as Record<string, unknown>).task_id
      : undefined;

  function handlePress() {
    if (typeof taskId === "string") {
      router.push(`/task/${taskId}`);
    } else {
      router.push("/(tabs)/tasks");
    }
  }

  if (isUrgent) {
    const dueTime = formatDueTime(notification.data?.due_at);

    return (
      <View className="border-b border-text-disabled px-6 py-5 gap-2.5">
        {/* Title */}
        <View className="flex-row items-center gap-1">
          {showUnreadDot && (
            <View className="size-2 rounded-full bg-primary mr-1" />
          )}
          <Text className="text-[15px] font-semibold text-black tracking-tight">
            {notification.title}
          </Text>
        </View>

        {/* Due time */}
        {dueTime !== null && (
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={16} color={PRIORITY_HIGH} />
            <Text className="text-[12px] text-priority-high tracking-tight">
              {dueTime}
            </Text>
          </View>
        )}

        {/* Body */}
        <View className="flex-row flex-wrap items-center gap-1">
          <Text className="text-[15px] text-text-default tracking-tight">
            An
          </Text>
          <UrgentTaskBadge />
          <Text className="flex-1 text-[15px] text-text-default tracking-tight">
            {" "}
            for your department needs your attention. Claim it now!
          </Text>
        </View>

        {/* CTA */}
        <Pressable
          onPress={handlePress}
          className="bg-primary items-center justify-center px-6 py-2.5 rounded w-full"
        >
          <Text className="text-white text-[14px]">Claim Now!</Text>
        </Pressable>
      </View>
    );
  }

  // Split "New Tasks Assigned for Monday" → bold prefix + regular suffix
  const forIndex = notification.title.indexOf(" for ");
  const titleBold =
    forIndex >= 0 ? notification.title.slice(0, forIndex) : notification.title;
  const titleSuffix = forIndex >= 0 ? notification.title.slice(forIndex) : "";
  const timestamp = formatTimestamp(notification.created_at, showUnreadDot);

  return (
    <Pressable
      onPress={handlePress}
      className="border-b border-text-disabled px-6 py-5"
    >
      <View className="gap-2">
        {/* Title */}
        <View className="flex-row items-center flex-wrap gap-1">
          {showUnreadDot && <View className="size-2 rounded-full bg-primary" />}
          <Text className="text-[15px] text-black tracking-tight flex-shrink">
            <Text className="font-semibold">{titleBold}</Text>
            <Text>{titleSuffix}</Text>
          </Text>
        </View>

        {/* Timestamp */}
        <Text className="text-[12px] text-primary tracking-tight">
          {timestamp}
        </Text>

        {/* Body */}
        <View className="flex-row flex-wrap items-center gap-1">
          <Text className="text-[15px] text-text-default tracking-tight">
            Your
          </Text>
          <NewTasksBadge />
          <Text className="text-[15px] text-text-default tracking-tight">
            have been assigned for the day
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
