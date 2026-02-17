import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

import { TaskBadge } from "@/components/tasks/task-badge";
import type { Task } from "@/data/mockTasks";

interface TaskCardProps {
  task: Task;
  variant: "assigned" | "unassigned";
  isExpanded: boolean;
}

function DotSeparator() {
  return (
    <View className="w-1 h-1 rounded-full bg-blue-600 mx-1.5" />
  );
}

export function TaskCard({ task, variant, isExpanded }: TaskCardProps) {
  const isAssigned = variant === "assigned";

  if (isAssigned && isExpanded) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 w-full">
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
          <Text className="text-lg font-bold">{task.title}</Text>
          <View className="flex-row flex-wrap gap-2 mt-1">
            <TaskBadge label={task.priority} />
            <TaskBadge label={task.location} />
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
        <Text className="text-lg font-bold">{task.title}</Text>
        <View className="flex-row flex-wrap gap-2 mt-1">
          <TaskBadge label={task.priority} />
          <TaskBadge label={task.location} />
          <TaskBadge label={task.department} variant="outlined" />
        </View>
      </View>
      <Pressable onPress={() => {}} className="p-1">
        <Feather name="more-horizontal" size={24} color="#6b7280" />
      </Pressable>
    </View>
  );
}
