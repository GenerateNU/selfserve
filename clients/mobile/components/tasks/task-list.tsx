import { FlatList, ListRenderItem } from "react-native";

import { TaskCard } from "@/components/tasks/task-card";
import type { Task } from "@/data/mockTasks";
import {VARIANT} from "@/constants/tasks";

interface TaskListProps {
  tasks: Task[];
  variant: (typeof VARIANT)[keyof typeof VARIANT];
}

export function TaskList({ tasks, variant }: TaskListProps) {
  const renderItem: ListRenderItem<Task> = ({ item, index }) => {
    const isExpanded =
      variant === VARIANT.ASSIGNED ? index === 0 : item.priority === "High";
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
