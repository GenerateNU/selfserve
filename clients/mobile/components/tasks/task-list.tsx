import { FlatList, ListRenderItem } from "react-native";

import { TaskCard } from "@/components/tasks/task-card";
import { TASK_ASSIGNMENT_STATE } from "@/constants/tasks";
import type { Task } from "@/types/tasks";

interface TaskListProps {
  tasks: Task[];
  variant: (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE];
  compact: boolean;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  onPressTask: (task: Task) => void;
  onStart: (task: Task) => void;
  onClaim: (task: Task) => void;
  onMarkDone: (task: Task) => void;
}

export function TaskList({
  tasks,
  variant,
  compact,
  onEndReached,
  isFetchingNextPage,
  onPressTask,
  onStart,
  onClaim,
  onMarkDone,
}: TaskListProps) {
  const renderItem: ListRenderItem<Task> = ({ item, index }) => {
    const isExpanded = compact
      ? false
      : variant === TASK_ASSIGNMENT_STATE.ASSIGNED
        ? index === 0
        : item.priority === "High";
    return (
      <TaskCard
        task={item}
        variant={variant}
        isExpanded={isExpanded}
        compact={compact}
        onPress={() => onPressTask(item)}
        onStart={() => onStart(item)}
        onClaim={() => onClaim(item)}
        onMarkDone={() => onMarkDone(item)}
      />
    );
  };

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="px-5 py-4 gap-4"
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.4}
      onEndReached={onEndReached}
      refreshing={Boolean(isFetchingNextPage)}
    />
  );
}
