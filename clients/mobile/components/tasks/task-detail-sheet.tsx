import Feather from "@expo/vector-icons/Feather";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import type { RequestFeedItem } from "@shared/api/requests";

type DetailRowProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-1.5">
        <Feather name={icon} size={14} color="#8b8b8b" />
        <Text className="text-[15px] text-[#8b8b8b] tracking-tight">{label}</Text>
      </View>
      <Text className="text-[15px] text-text-default tracking-tight">{value}</Text>
    </View>
  );
}

function formatLocation(roomNumber?: number | null): string {
  return roomNumber != null ? `Room ${roomNumber}` : "—";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

type TaskDetailSheetProps = {
  task: RequestFeedItem | null;
  onClose: () => void;
};

export function TaskDetailSheet({ task, onClose }: TaskDetailSheetProps) {
  if (!task) return null;

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Dimmed backdrop — sits behind the sheet */}
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

        {/* Sheet panel — rounded top corners, blocks touches from reaching backdrop */}
        <View
          className="bg-bg-surface rounded-tl-3xl rounded-tr-3xl pb-12 pt-10 px-6"
          onStartShouldSetResponder={() => true}
        >
        {/* Drag handle */}
        <View className="items-center mb-6">
          <View className="w-11 h-1 rounded-full bg-text-disabled" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text className="text-2xl font-bold text-text-default tracking-tight mb-6">
            {task.name}
          </Text>

          {/* Detail rows */}
          <View className="gap-4 mb-6">
            <DetailRow
              icon="clipboard"
              label="Task Type"
              value={capitalize(task.request_type)}
            />
            <DetailRow
              icon="clock"
              label="Deadline"
              value={formatTime(task.created_at)}
            />
            <DetailRow
              icon="flag"
              label="Priority"
              value={capitalize(task.priority)}
            />
            <DetailRow
              icon="map-pin"
              label="Location"
              value={formatLocation(task.room_number)}
            />
            {task.request_category ? (
              <DetailRow
                icon="home"
                label="Department"
                value={task.request_category}
              />
            ) : null}
          </View>

          {/* Description */}
          {task.description ? (
            <View className="gap-1 mb-6">
              <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                Description
              </Text>
              <Text className="text-[15px] text-text-default tracking-tight leading-snug">
                {task.description}
              </Text>
            </View>
          ) : null}

          {/* Mark as Done button */}
          <Pressable
            onPress={onClose}
            className="bg-primary rounded items-center justify-center py-2.5 w-full"
          >
            <Text className="text-white text-[14px] leading-5">Mark as Done</Text>
          </Pressable>
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
