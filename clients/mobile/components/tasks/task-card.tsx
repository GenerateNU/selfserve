import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

import { TaskBadge } from "@/components/tasks/task-badge";
import { TASK_ASSIGNMENT_STATE } from "@/constants/tasks";
import type { RequestFeedItem } from "@shared/api/requests";

interface TaskCardProps {
  task: RequestFeedItem;
  variant: (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE];
  isExpanded: boolean;
}

function DotSeparator() {
  return <View className="w-1 h-1 rounded-full bg-blue-600 mx-1.5" />;
}

function locationLabel(roomNumber?: number | null): string {
  return roomNumber != null ? `Room ${roomNumber}` : "Unassigned";
}

export function TaskCard({ task, variant, isExpanded }: TaskCardProps) {
  const isAssigned = variant === TASK_ASSIGNMENT_STATE.ASSIGNED;
  const location = locationLabel(task.room_number);

  if (isAssigned && isExpanded) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 w-full">
        <Text className="text-lg font-bold">{task.name}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm">{task.priority}</Text>
          {task.request_category && (
            <>
              <DotSeparator />
              <Text className="text-sm">{task.request_category}</Text>
            </>
          )}
        </View>
        {task.description && (
          <Text className="text-sm text-gray-600 mt-1">{task.description}</Text>
        )}
        <Pressable
          onPress={() => {}}
          className="bg-blue-600 rounded-lg py-3 w-full items-center mt-3"
        >
          <Text className="text-white font-medium">Start</Text>
        </Pressable>
      </View>
    );
  }

  if (isAssigned && !isExpanded) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 w-full flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold">{task.name}</Text>
          <View className="flex-row flex-wrap gap-2 mt-1">
            <TaskBadge label={task.priority} />
            <TaskBadge label={location} />
          </View>
        </View>
        <Pressable onPress={() => {}} className="p-1">
          <Feather name="more-horizontal" size={24} color="#6b7280" />
        </Pressable>
      </View>
    );
  }

  if (!isAssigned && isExpanded) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 w-full">
        <Text className="text-lg font-bold">{task.name}</Text>
        <View className="flex-row flex-wrap gap-2 mt-1">
          <TaskBadge label={task.priority} />
          <TaskBadge label={location} />
          {task.request_category && (
            <TaskBadge label={task.request_category} variant="outlined" />
          )}
        </View>
        {task.description && (
          <Text className="text-sm text-gray-600 mt-1">{task.description}</Text>
        )}
        <Pressable
          onPress={() => {}}
          className="bg-white border border-gray-300 rounded-lg py-3 w-full items-center mt-3"
        >
          <Text className="text-black font-medium">Claim Task</Text>
        </Pressable>
      </View>
    );
  }

  // Compact unassigned
  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4 w-full flex-row justify-between items-start">
      <View className="flex-1">
        <Text className="text-lg font-bold">{task.name}</Text>
        <View className="flex-row flex-wrap gap-2 mt-1">
          <TaskBadge label={task.priority} />
          <TaskBadge label={location} />
          {task.request_category && (
            <TaskBadge label={task.request_category} variant="outlined" />
          )}
        </View>
      </View>
      <Pressable onPress={() => {}} className="p-1">
        <Feather name="more-horizontal" size={24} color="#6b7280" />
      </Pressable>
    </View>
  );
}
