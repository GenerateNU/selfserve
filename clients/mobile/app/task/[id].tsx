import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { useGetRequest } from "@shared/api/requests";
import { PriorityTag } from "@/components/tasks/priority-tag";
import { ScreenHeader } from "@/components/ui/screen-header";

const TEXT_SECONDARY = "#5d5d5d";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-3 border-b border-stroke-subtle gap-1">
      <Text className="text-[12px] text-text-subtle tracking-tight">{label}</Text>
      <Text className="text-[15px] text-text-default tracking-tight">{value}</Text>
    </View>
  );
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: task, isLoading, isError } = useGetRequest(id);

  return (
    <SafeAreaView className="flex-1 bg-bg-surface" edges={["top"]}>
      <ScreenHeader title="Task Detail" />

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[15px] text-text-subtle text-center">
            Could not load task.
          </Text>
        </View>
      )}

      {task && (
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Name + priority */}
          <View className="pt-5 pb-3 gap-3 border-b border-stroke-subtle">
            <PriorityTag priority={task.priority} />
            <Text className="text-[20px] font-semibold text-text-default tracking-tight leading-snug">
              {task.name}
            </Text>
            {task.request_category && (
              <View className="flex-row items-center gap-1.5">
                <Feather name="home" size={13} color={TEXT_SECONDARY} />
                <Text className="text-[13px] text-text-secondary tracking-tight">
                  {task.request_category}
                </Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View className="mt-1">
            <DetailRow label="Status" value={task.status} />
            <DetailRow label="Type" value={task.request_type} />
            {task.department && (
              <DetailRow label="Department" value={task.department} />
            )}
            {task.estimated_completion_time != null && (
              <DetailRow
                label="Estimated time"
                value={`${task.estimated_completion_time} min`}
              />
            )}
            {task.scheduled_time && (
              <DetailRow label="Scheduled" value={formatDate(task.scheduled_time)} />
            )}
            <DetailRow label="Created" value={formatDate(task.created_at)} />
          </View>

          {/* Description */}
          {task.description && (
            <View className="mt-4 gap-1">
              <Text className="text-[12px] text-text-subtle tracking-tight">Description</Text>
              <Text className="text-[15px] text-text-default tracking-tight leading-relaxed">
                {task.description}
              </Text>
            </View>
          )}

          {/* Notes */}
          {task.notes && (
            <View className="mt-4 gap-1">
              <Text className="text-[12px] text-text-subtle tracking-tight">Notes</Text>
              <Text className="text-[15px] text-text-default tracking-tight leading-relaxed">
                {task.notes}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
