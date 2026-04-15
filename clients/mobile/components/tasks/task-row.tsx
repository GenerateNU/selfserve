import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

import { PriorityTag } from "@/components/tasks/priority-tag";
import type { RequestFeedItem } from "@shared/api/requests";

type TaskRowProps = {
  task: RequestFeedItem;
  onPress?: (task: RequestFeedItem) => void;
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = date
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  return isToday
    ? `Today at ${time}`
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatLocation(roomNumber?: number | null): string {
  return roomNumber != null ? `Room ${roomNumber}` : "—";
}

export function TaskRow({ task, onPress }: TaskRowProps) {
  const isCompleted = task.status === "completed";

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      className="bg-bg-surface border-b border-stroke-subtle px-6 py-5 flex-row items-start justify-between gap-3"
    >
      {/* Left content */}
      <View className="flex-1 gap-2">
        {/* Tags row */}
        <View className="flex-row flex-wrap gap-2 items-start">
          <PriorityTag priority={task.priority} dimmed={isCompleted} />
          {task.request_category ? (
            <View className="bg-[#f8f8f8] flex-row items-center gap-1.5 h-6 px-2 rounded">
              <Feather
                name="home"
                size={12}
                color={isCompleted ? "#bababa" : "#464646"}
              />
              <Text
                className={`text-xs ${isCompleted ? "text-text-disabled" : "text-[#464646]"}`}
                numberOfLines={1}
              >
                {task.request_category}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <Text
          className={`text-[15px] font-bold leading-snug tracking-tight ${
            isCompleted ? "text-[#979797]" : "text-[#040506]"
          }`}
          numberOfLines={2}
        >
          {task.name}
        </Text>

        {/* Meta row: time + location */}
        <View className="flex-row flex-wrap gap-3 items-center">
          <View className="flex-row items-center gap-1">
            <Feather
              name="clock"
              size={14}
              color={isCompleted ? "#bababa" : "#808080"}
            />
            <Text
              className={`text-[13px] leading-snug ${
                isCompleted ? "text-text-disabled" : "text-text-subtle"
              }`}
              numberOfLines={1}
            >
              {formatTime(task.created_at)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Feather
              name="map-pin"
              size={14}
              color={isCompleted ? "#bababa" : "#808080"}
            />
            <Text
              className={`text-[13px] leading-snug ${
                isCompleted ? "text-text-disabled" : "text-text-subtle"
              }`}
              numberOfLines={1}
            >
              {formatLocation(task.room_number)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {task.description ? (
          <Text
            className={`text-[13px] leading-snug ${
              isCompleted ? "text-text-disabled" : "text-text-secondary"
            }`}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}
      </View>

      {/* Checkbox */}
      {isCompleted ? (
        <View className="w-[30px] h-[30px] rounded bg-primary-surface items-center justify-center p-1.5 shrink-0">
          <Feather name="check" size={16} color="white" />
        </View>
      ) : (
        <View
          className="w-[30px] h-[30px] rounded border border-[#2e2e2e] shrink-0"
          style={{ opacity: 0.5 }}
        />
      )}
    </Pressable>
  );
}
