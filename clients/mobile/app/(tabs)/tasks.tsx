import { useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabBar } from "@/components/tasks/tab-bar";
import { TaskList } from "@/components/tasks/task-list";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TAB, TabName } from "@/constants/tasks";
import { useGetRequestsFeed } from "@shared/api/requests";

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<TabName>(TAB.MY_TASKS);
  const { userId } = useAuth();

  const myTasksQuery = useGetRequestsFeed({ userId: userId ?? undefined });
  const myTaskItems =
    myTasksQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const unassignedQuery = useGetRequestsFeed({ unassigned: true });
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
      <TasksHeader />
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
          />
        )}
      </View>
    </SafeAreaView>
  );
}
