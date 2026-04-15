import { useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabBar } from "@/components/tasks/tab-bar";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskFilterSheet } from "@/components/tasks/task-filter-sheet";
import { TaskList } from "@/components/tasks/task-list";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TAB, TabName } from "@/constants/tasks";
import {
  useCompleteTask,
  useGetRequestsFeed,
  type RequestFeedItem,
  type RequestFeedSort,
} from "@shared/api/requests";

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<TabName>(TAB.MY_TASKS);
  const [selectedTask, setSelectedTask] = useState<RequestFeedItem | null>(
    null,
  );
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sort, setSort] = useState<RequestFeedSort>("priority");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const { userId } = useAuth();
  const { mutate: completeTask } = useCompleteTask();

  const myTasksQuery = useGetRequestsFeed({
    userId: userId ?? undefined,
    sort,
    priorities,
    departments,
  });
  const myTaskItems =
    myTasksQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const unassignedQuery = useGetRequestsFeed({
    unassigned: true,
    sort,
    priorities,
    departments,
  });
  const unassignedItems =
    unassignedQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const activeQuery =
    activeTab === TAB.MY_TASKS ? myTasksQuery : unassignedQuery;

  function handleEndReached() {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-surface" edges={["top"]}>
      <TasksHeader
        onFilterPress={() => setFilterSheetOpen(true)}
        filterActive={filterSheetOpen}
      />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <View className="flex-1">
        {activeQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <TaskList
            tasks={activeTab === TAB.MY_TASKS ? myTaskItems : unassignedItems}
            onEndReached={handleEndReached}
            isLoadingMore={activeQuery.isFetchingNextPage}
            onTaskPress={setSelectedTask}
            onComplete={
              activeTab === TAB.MY_TASKS
                ? (id: string) => completeTask(id)
                : undefined
            }
          />
        )}
      </View>
      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={(id) => completeTask(id)}
      />
      <TaskFilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        sort={sort}
        onSortChange={setSort}
        priorities={priorities}
        onPrioritiesChange={setPriorities}
        departments={departments}
        onDepartmentsChange={setDepartments}
      />
    </SafeAreaView>
  );
}
