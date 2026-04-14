import { useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveFilterChips } from "@/components/tasks/active-filter-chips";
import { TabBar } from "@/components/tasks/tab-bar";
import { TaskList } from "@/components/tasks/task-list";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TAB, TabName } from "@/constants/tasks";
import { useGetRequestsFeed } from "@shared/api/requests";

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<TabName>(TAB.MY_TASKS);
  const { userId } = useAuth();

  const myTasksQuery = useGetRequestsFeed({ userId: userId ?? undefined });
  const myTaskItems = myTasksQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [];

  function handleEndReached() {
    if (myTasksQuery.hasNextPage && !myTasksQuery.isFetchingNextPage) {
      myTasksQuery.fetchNextPage();
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-surface" edges={["top"]}>
      <TasksHeader />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === TAB.UNASSIGNED && (
        <ActiveFilterChips
          filters={[
            { label: "Department: Room Service", value: "room-service" },
          ]}
          onRemoveFilter={() => {}}
          onClearAll={() => {}}
        />
      )}
      <View className="flex-1">
        {activeTab === TAB.MY_TASKS && (
          myTasksQuery.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <TaskList
              tasks={myTaskItems}
              onEndReached={handleEndReached}
              isLoadingMore={myTasksQuery.isFetchingNextPage}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}
