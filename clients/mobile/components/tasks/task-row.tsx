import Feather from "@expo/vector-icons/Feather";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PriorityTag } from "@/components/tasks/priority-tag";
import { Colors } from "@/constants/theme";
import type { RequestFeedItem } from "@shared/api/requests";

type TaskRowProps = {
  task: RequestFeedItem;
  onPress?: (task: RequestFeedItem) => void;
  onCheckboxPress?: () => void;
  onPickUp?: () => void;
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

export function TaskRow({
  task,
  onPress,
  onCheckboxPress,
  onPickUp,
}: TaskRowProps) {
  const isCompleted = task.status === "completed";
  const [visuallyUnchecked, setVisuallyUnchecked] = useState(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleUncheckPress() {
    if (pendingTimer.current) return;
    setVisuallyUnchecked(true);
    pendingTimer.current = setTimeout(() => {
      pendingTimer.current = null;
      onCheckboxPress?.();
    }, 400);
  }

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
            <View className="bg-bg-input flex-row items-center gap-1.5 h-6 px-2 rounded">
              <Feather
                name="home"
                size={12}
                color={
                  isCompleted
                    ? Colors.light.iconDisabled
                    : Colors.light.iconMuted
                }
              />
              <Text
                className={`text-xs ${isCompleted ? "text-text-disabled" : "text-text-secondary"}`}
                numberOfLines={1}
              >
                {task.request_category}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <Text
          className={`text-base font-bold leading-snug tracking-tight ${
            isCompleted ? "text-text-subtle" : "text-text-default"
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
              color={
                isCompleted
                  ? Colors.light.iconDisabled
                  : Colors.light.iconSubtle
              }
            />
            <Text
              className={`text-sm leading-snug ${
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
              color={
                isCompleted
                  ? Colors.light.iconDisabled
                  : Colors.light.iconSubtle
              }
            />
            <Text
              className={`text-sm leading-snug ${
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
            className={`text-sm leading-snug ${
              isCompleted ? "text-text-disabled" : "text-text-secondary"
            }`}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}
      </View>

      {/* Action button */}
      {onPickUp ? (
        <Pressable
          onPress={onPickUp}
          hitSlop={4}
          className="w-11 h-11 items-center justify-center shrink-0"
        >
          <View className="bg-primary rounded-xl p-2 items-center justify-center">
            <Feather name="plus" size={22} color={Colors.light.white} />
          </View>
        </Pressable>
      ) : isCompleted && !visuallyUnchecked ? (
        <Pressable
          onPress={handleUncheckPress}
          hitSlop={8}
          className="w-8 h-8 rounded bg-primary-surface items-center justify-center p-1.5 shrink-0"
        >
          <Feather name="check" size={16} color={Colors.light.white} />
        </Pressable>
      ) : (
        <Pressable
          onPress={onCheckboxPress}
          hitSlop={8}
          className="w-8 h-8 rounded border border-text-default shrink-0 items-center justify-center"
          style={{ opacity: 0.5 }}
        />
      )}
    </Pressable>
  );
}
