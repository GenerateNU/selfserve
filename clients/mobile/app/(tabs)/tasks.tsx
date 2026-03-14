import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveFilterChips } from "@/components/tasks/active-filter-chips";
import { TabBar } from "@/components/tasks/tab-bar";
import { TaskList } from "@/components/tasks/task-list";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TAB, TabName, VARIANT } from "@/constants/tasks";
import { myTasks, unassignedTasks } from "@/data/mockTasks";

const tabConfigs: Record<TabName, { tasks: typeof myTasks; variant: (typeof VARIANT)[keyof typeof VARIANT]; showFilters: boolean }> = {
  [TAB.MY_TASKS]: { tasks: myTasks, variant: VARIANT.ASSIGNED, showFilters: false },
  [TAB.UNASSIGNED]: { tasks: unassignedTasks, variant: VARIANT.UNASSIGNED, showFilters: true },
};

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<TabName>(TAB.MY_TASKS);
  const currentTab = tabConfigs[activeTab];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <TasksHeader />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {currentTab.showFilters && (
        <ActiveFilterChips
          filters={[{ label: "Department: Room Service", value: "room-service" }]}
          onRemoveFilter={() => {}}
          onClearAll={() => {}}
        />
      )}
      <View className="flex-1">
        <TaskList tasks={currentTab.tasks} variant={currentTab.variant} />
      </View>
    </SafeAreaView>
  );
}