import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { TaskRow } from "@/components/tasks/task-row";
import type { RequestFeedItem } from "@shared/api/requests";

type SectionHeader = { _type: "section-header"; title: string };
type ListItem = RequestFeedItem | SectionHeader;

function isSectionHeader(item: ListItem): item is SectionHeader {
  return "_type" in item && item._type === "section-header";
}

type TaskListProps = {
  tasks: RequestFeedItem[];
  onEndReached?: () => void;
  isLoadingMore?: boolean;
};

export function TaskList({ tasks, onEndReached, isLoadingMore }: TaskListProps) {
  const active = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  const data: ListItem[] = [
    ...active,
    ...(completed.length > 0
      ? [{ _type: "section-header" as const, title: "Completed Tasks" }, ...completed]
      : []),
  ];

  return (
    <FlatList<ListItem>
      data={data}
      keyExtractor={(item) =>
        isSectionHeader(item) ? "section-completed" : item.id
      }
      renderItem={({ item }) => {
        if (isSectionHeader(item)) {
          return (
            <View className="px-6 py-4">
              <Text className="text-[15px] font-medium text-text-default tracking-tight">
                {item.title}
              </Text>
            </View>
          );
        }
        return <TaskRow task={item} />;
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="py-4 items-center">
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}
