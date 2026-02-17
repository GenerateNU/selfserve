import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveFilterChips } from "@/components/tasks/active-filter-chips";
import { TabBar } from "@/components/tasks/tab-bar";
import { TaskList } from "@/components/tasks/task-list";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { myTasks, unassignedTasks } from "@/data/mockTasks";

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<"myTasks" | "unassigned">("myTasks");

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <TasksHeader />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "unassigned" && (
        <ActiveFilterChips
          filters={[{ label: "Department: Room Service", value: "room-service" }]}
          onRemoveFilter={() => {}}
          onClearAll={() => {}}
        />
      )}
      <View className="flex-1">
        <TaskList
          tasks={activeTab === "myTasks" ? myTasks : unassignedTasks}
          variant={activeTab === "myTasks" ? "assigned" : "unassigned"}
        />
      </View>
    </SafeAreaView>
  );
}
