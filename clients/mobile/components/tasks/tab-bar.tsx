import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, Text, View } from "react-native";

const TAB = {
  MY_TASKS: "myTasks",
  UNASSIGNED: "unassigned",
} as const;

type TabId = (typeof TAB)[keyof typeof TAB];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <View className="flex-row w-full">
      <Pressable
        onPress={() => onTabChange(TAB.MY_TASKS)}
        className={`w-1/2 items-center py-3 border-b-2 ${
          activeTab === TAB.MY_TASKS
            ? "border-blue-600"
            : "border-b border-gray-200"
        }`}
      >
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons
            name="dots-grid"
            size={14}
            color={activeTab === TAB.MY_TASKS ? "#000" : "#9ca3af"}
          />
          <Text
            className={
              activeTab === TAB.MY_TASKS
                ? "text-black font-semibold"
                : "text-gray-400"
            }
          >
            My Tasks
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => onTabChange(TAB.UNASSIGNED)}
        className={`w-1/2 items-center py-3 border-b-2 ${
          activeTab === TAB.UNASSIGNED
            ? "border-blue-600"
            : "border-b border-gray-200"
        }`}
      >
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons
            name="dots-grid"
            size={14}
            color={activeTab === TAB.UNASSIGNED ? "#000" : "#9ca3af"}
          />
          <Text
            className={
              activeTab === TAB.UNASSIGNED
                ? "text-black font-semibold"
                : "text-gray-400"
            }
          >
            Unassigned Tasks
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
