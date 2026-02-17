import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, Text, View } from "react-native";

type TabId = "myTasks" | "unassigned";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <View className="flex-row w-full">
      <Pressable
        onPress={() => onTabChange("myTasks")}
        className={`w-1/2 items-center py-3 border-b-2 ${
          activeTab === "myTasks"
            ? "border-blue-600"
            : "border-b border-gray-200"
        }`}
      >
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons
            name="dots-grid"
            size={14}
            color={activeTab === "myTasks" ? "#000" : "#9ca3af"}
          />
          <Text
            className={
              activeTab === "myTasks"
                ? "text-black font-semibold"
                : "text-gray-400"
            }
          >
            My Tasks
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => onTabChange("unassigned")}
        className={`w-1/2 items-center py-3 border-b-2 ${
          activeTab === "unassigned"
            ? "border-blue-600"
            : "border-b border-gray-200"
        }`}
      >
        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons
            name="dots-grid"
            size={14}
            color={activeTab === "unassigned" ? "#000" : "#9ca3af"}
          />
          <Text
            className={
              activeTab === "unassigned"
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
