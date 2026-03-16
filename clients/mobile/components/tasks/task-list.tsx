import { FlatList, ListRenderItem } from "react-native";

import { TaskCard } from "@/components/tasks/task-card";
import type { Task } from "@/data/mockTasks";
import { TASK_ASSIGNMENT_STATE } from "@/constants/tasks";

interface TaskListProps {
  tasks: Task[];
  variant: (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE];
}

export function TaskList({ tasks, variant }: TaskListProps) {
  const renderItem: ListRenderItem<Task> = ({ item, index }) => {
    const isExpanded =
      variant === TASK_ASSIGNMENT_STATE.ASSIGNED ? index === 0 : item.priority === "High";
    return (
      <TaskCard task={item} variant={variant} isExpanded={isExpanded} />
    );
  };

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerClassName="px-[5vw] py-4 gap-4"
      showsVerticalScrollIndicator={false}
    />
  );
}
