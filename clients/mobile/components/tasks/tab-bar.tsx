import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

import { TAB, TabName } from "@/constants/tasks";

interface TabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const ACTIVE_COLOR = "#15502c";
const INACTIVE_COLOR = "#464646";

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const myTasksActive = activeTab === TAB.MY_TASKS;
  const unassignedActive = activeTab === TAB.UNASSIGNED;

  return (
    <View
      className="flex-row w-full"
      style={{ borderBottomWidth: 1, borderBottomColor: "#e5e9ed" }}
    >
      <Pressable
        onPress={() => onTabChange(TAB.MY_TASKS)}
        className="flex-1 flex-row items-center justify-center gap-1 px-3 py-2"
        style={{
          borderBottomWidth: 2,
          borderBottomColor: myTasksActive ? ACTIVE_COLOR : "transparent",
        }}
      >
        <Feather
          name="check-square"
          size={16}
          color={myTasksActive ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
        <Text
          className="text-[15px] tracking-tight"
          style={{ color: myTasksActive ? ACTIVE_COLOR : INACTIVE_COLOR }}
        >
          My Tasks
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onTabChange(TAB.UNASSIGNED)}
        className="flex-1 flex-row items-center justify-center gap-1 px-3 py-2"
        style={{
          borderBottomWidth: 2,
          borderBottomColor: unassignedActive ? ACTIVE_COLOR : "transparent",
        }}
      >
        <Feather
          name="clipboard"
          size={16}
          color={unassignedActive ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
        <Text
          className="text-[15px] tracking-tight"
          style={{ color: unassignedActive ? ACTIVE_COLOR : INACTIVE_COLOR }}
        >
          Unassigned Tasks
        </Text>
      </Pressable>
    </View>
  );
}
