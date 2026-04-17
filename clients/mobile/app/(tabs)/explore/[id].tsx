import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Flag,
  MapPin,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetRequestRoomId, useAssignRequestToSelf } from "@shared";
import type { GuestRequest } from "@shared";
import { Colors } from "@/constants/theme";
import { GuestInfoTab } from "@/components/rooms/guest-info-tab";

type TabId = "tasks" | "guest-info" | "details";

const TABS: { id: TabId; label: string }[] = [
  { id: "tasks", label: "Tasks" },
  { id: "guest-info", label: "Guest Info" },
  { id: "details", label: "Details" },
];

function TaskCard({
  task,
  showAssign,
  onAssign,
}: {
  task: GuestRequest;
  showAssign?: boolean;
  onAssign?: () => void;
}) {
  return (
    <View className="bg-white border border-stroke-disabled p-3 rounded gap-3">
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-2">
          <Text className="text-base font-medium text-text-default">
            {task.name}
          </Text>
          <View className="flex-row items-center gap-1">
            <MapPin size={10} color={Colors.light.iconMuted} />
            <Text className="text-xs text-text-secondary">
              Floor {task.floor}, Room {task.room_number}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-3 items-center">
            {task.priority === "high" && (
              <View className="flex-row items-center gap-1 bg-priority-high-bg px-2 py-1 rounded">
                <Flag size={12} color={Colors.light.danger} />
                <Text className="text-xs text-priority-high">
                  High Priority
                </Text>
              </View>
            )}
            {task.department_name && (
              <View className="flex-row items-center gap-2 h-6 px-2 rounded border border-stroke-subtle">
                <Text className="text-xs text-text-default">
                  {task.department_name}
                </Text>
              </View>
            )}
          </View>
        </View>
        <ChevronUp size={18} color={Colors.light.iconMuted} />
      </View>
      {showAssign && (
        <Pressable
          className="bg-primary items-center justify-center px-6 py-[10px] rounded"
          onPress={onAssign}
        >
          <Text className="text-white text-sm">Assign to Self</Text>
        </Pressable>
      )}
    </View>
  );
}

function Section({
  title,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Pressable
        className="flex-row items-center justify-between"
        onPress={onToggle}
      >
        <Text className="text-[15px] font-medium text-text-default">
          {title} ({count})
        </Text>
        {expanded ? (
          <ChevronUp size={14} color={Colors.light.iconMuted} />
        ) : (
          <ChevronDown size={14} color={Colors.light.iconMuted} />
        )}
      </Pressable>
      {expanded && children}
    </View>
  );
}

export default function RoomDetailScreen() {
  const { id, roomNumber, guestIds: guestIdsParam } = useLocalSearchParams<{
    id: string;
    roomNumber: string;
    guestIds: string;
  }>();

  const guestIds = guestIdsParam
    ? guestIdsParam.split(",").filter(Boolean)
    : [];

  const [activeTab, setActiveTab] = useState<TabId>("tasks");
  const [yourTasksExpanded, setYourTasksExpanded] = useState(true);
  const [unassignedExpanded, setUnassignedExpanded] = useState(true);

  const { data, isLoading } = useGetRequestRoomId(id, {
    query: { enabled: !!id },
  });
  const { mutate: assignToSelf } = useAssignRequestToSelf(id);

  const assigned = data?.assigned ?? [];
  const unassigned = data?.unassigned ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pb-2 pt-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={20} color={Colors.light.textDefault} />
        </Pressable>
        <Text className="text-2xl font-medium text-text-default tracking-tight">
          Room {roomNumber}
        </Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row border-b border-stroke-subtle">
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            className={`flex-1 flex-row items-center justify-center gap-2 py-2 px-3 ${
              activeTab === tab.id ? "border-b-2 border-primary" : ""
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              className={`text-sm ${
                activeTab === tab.id ? "text-primary" : "text-text-secondary"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tasks tab */}
      {activeTab === "tasks" &&
        (isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              gap: 16,
              paddingHorizontal: 24,
              paddingBottom: 24,
              paddingTop: 16,
            }}
          >
            {/* Your Tasks */}
            <Section
              title="Your Tasks"
              count={assigned.length}
              expanded={yourTasksExpanded}
              onToggle={() => setYourTasksExpanded((v) => !v)}
            >
              <View className="gap-2">
                {assigned.map((task, i) => (
                  <TaskCard key={task.id ?? i} task={task} />
                ))}
              </View>
            </Section>

            {/* Unassigned Tasks */}
            <Section
              title="Unassigned Tasks"
              count={unassigned.length}
              expanded={unassignedExpanded}
              onToggle={() => setUnassignedExpanded((v) => !v)}
            >
              <View className="gap-2">
                {unassigned.map((task, i) => (
                  <TaskCard
                    key={task.id ?? i}
                    task={task}
                    showAssign
                    onAssign={() => task.id && assignToSelf(task.id)}
                  />
                ))}
              </View>
            </Section>
          </ScrollView>
        ))}

      {/* Guest Info tab */}
      {activeTab === "guest-info" && (
        <GuestInfoTab guestIds={guestIds} />
      )}
    </SafeAreaView>
  );
}
