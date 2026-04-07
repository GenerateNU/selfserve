import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  View,
} from "react-native";

import { TaskCard } from "@/components/tasks/task-card";
import { TASK_ASSIGNMENT_STATE } from "@/constants/tasks";
import type { Task } from "@/types/tasks";

interface TaskListProps {
  tasks: Task[];
  variant: (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE];
  onOpenDetail: (task: Task) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onClaim: (id: string) => void;
  isMutating: boolean;
  onEndReached: () => void;
  listFooter: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function TaskList({
  tasks,
  variant,
  onOpenDetail,
  onStart,
  onComplete,
  onClaim,
  isMutating,
  onEndReached,
  listFooter,
  refreshing,
  onRefresh,
}: TaskListProps) {
  const renderItem: ListRenderItem<Task> = ({ item, index }) => {
    const isExpanded =
      variant === TASK_ASSIGNMENT_STATE.ASSIGNED
        ? index === 0
        : item.priority.toLowerCase() === "high";
    return (
      <TaskCard
        task={item}
        variant={variant}
        isExpanded={isExpanded}
        busy={isMutating}
        onOpenDetail={() => onOpenDetail(item)}
        onPrimary={() => {
          if (variant === TASK_ASSIGNMENT_STATE.UNASSIGNED) {
            onClaim(item.id);
            return;
          }
          if (item.status === "assigned") onStart(item.id);
          else if (item.status === "in progress") onComplete(item.id);
        }}
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
      onEndReached={onEndReached}
      onEndReachedThreshold={0.35}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListFooterComponent={
        listFooter ? (
          <View className="py-4">
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}
