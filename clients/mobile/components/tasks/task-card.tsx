import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

import { TaskBadge } from "@/components/tasks/task-badge";
import { TASK_ASSIGNMENT_STATE } from "@/constants/tasks";
import type { Task } from "@/types/tasks";

interface TaskCardProps {
  task: Task;
  variant: (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE];
  isExpanded: boolean;
  compact?: boolean;
  onPress?: () => void;
  onStart?: () => void;
  onClaim?: () => void;
  onMarkDone?: () => void;
}

function DotSeparator() {
  return <View className="w-1 h-1 rounded-full bg-blue-600 mx-1.5" />;
}

export function TaskCard({
  task,
  variant,
  isExpanded,
  compact,
  onPress,
  onStart,
  onClaim,
  onMarkDone,
}: TaskCardProps) {
  const isAssigned = variant === TASK_ASSIGNMENT_STATE.ASSIGNED;
  const expanded = compact ? false : isExpanded;

  if (isAssigned && expanded) {
    return (
      <Pressable onPress={onPress} className="bg-white rounded-xl border border-gray-200 p-4 w-full">
        <Text className="text-lg font-bold">{task.title}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm">{task.priority}</Text>
          <DotSeparator />
          <Text className="text-sm">{task.department}</Text>
          {task.dueTime && (
            <>
              <DotSeparator />
              <Text className="text-sm">{task.dueTime}</Text>
            </>
          )}
        </View>
        {task.description && (
          <Text className="text-sm text-gray-600 mt-1">{task.description}</Text>
        )}
        {task.status === "in progress" ? (
          <Pressable
            onPress={onMarkDone}
            className="bg-emerald-600 rounded-lg py-3 w-full items-center mt-3"
          >
            <Text className="text-white font-medium">Mark done</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onStart}
            className="bg-blue-600 rounded-lg py-3 w-full items-center mt-3"
          >
            <Text className="text-white font-medium">Start</Text>
          </Pressable>
        )}
      </Pressable>
    );
  }

  if (isAssigned && !expanded) {
    return (
      <Pressable
        onPress={onPress}
        className="bg-white rounded-xl border border-gray-200 p-4 w-full flex-row justify-between items-start"
      >
        <View className="flex-1">
          <Text className="text-lg font-bold">{task.title}</Text>
          <View className="flex-row flex-wrap gap-2 mt-1">
            <TaskBadge label={task.priority} />
            <TaskBadge label={task.location} />
          </View>
        </View>
        <Pressable onPress={onPress} className="p-1" accessibilityLabel="Open task details">
          <Feather name="more-horizontal" size={24} color="#6b7280" />
        </Pressable>
      </Pressable>
    );
  }

  if (!isAssigned && expanded) {
    return (
      <Pressable onPress={onPress} className="bg-white rounded-xl border border-gray-200 p-4 w-full">
        <Text className="text-lg font-bold">{task.title}</Text>
        <View className="flex-row flex-wrap gap-2 mt-1">
          <TaskBadge label={task.priority} />
          <TaskBadge label={task.location} />
          <TaskBadge label={task.department} variant="outlined" />
        </View>
        {task.description && (
          <Text className="text-sm text-gray-600 mt-1">{task.description}</Text>
        )}
        <Pressable
          onPress={onClaim}
          className="bg-white border border-gray-300 rounded-lg py-3 w-full items-center mt-3"
        >
          <Text className="text-black font-medium">Claim Task</Text>
        </Pressable>
      </Pressable>
    );
  }

  // Compact unassigned
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl border border-gray-200 p-4 w-full flex-row justify-between items-start"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold">{task.title}</Text>
        <View className="flex-row flex-wrap gap-2 mt-1">
          <TaskBadge label={task.priority} />
          <TaskBadge label={task.location} />
          <TaskBadge label={task.department} variant="outlined" />
        </View>
      </View>
      <Pressable onPress={onPress} className="p-1" accessibilityLabel="Open task details">
        <Feather name="more-horizontal" size={24} color="#6b7280" />
      </Pressable>
    </Pressable>
  );
}
