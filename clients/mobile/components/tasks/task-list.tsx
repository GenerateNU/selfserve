import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
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
  onTaskPress?: (task: RequestFeedItem) => void;
  onComplete?: (taskId: string) => void;
};

function SwipeCompleteAction() {
  return (
    <View
      style={{ backgroundColor: Colors.light.tabBarHighlight }}
      className="flex-1 justify-center items-center flex-row gap-3 px-8"
    >
      <View className="bg-primary rounded-lg w-9 h-9 items-center justify-center">
        <Feather name="check" size={18} color="white" />
      </View>
      <Text className="text-primary text-base font-medium">
        Task completed!
      </Text>
    </View>
  );
}

type SwipeableRowProps = {
  item: RequestFeedItem;
  onTaskPress?: (task: RequestFeedItem) => void;
  onComplete: (taskId: string) => void;
};

function SwipeableTaskRow({
  item,
  onTaskPress,
  onComplete,
}: SwipeableRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const touchStartX = useRef(0);
  const hasSwiped = useRef(false);

  function handleOpen(direction: "left" | "right") {
    if (direction !== "left") return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(item.id);
    setTimeout(() => swipeableRef.current?.close(), 300);
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={1.5}
      rightThreshold={60}
      renderRightActions={() => <SwipeCompleteAction />}
      onSwipeableOpen={handleOpen}
    >
      <View
        onTouchStart={(e) => {
          touchStartX.current = e.nativeEvent.pageX;
          hasSwiped.current = false;
        }}
        onTouchMove={(e) => {
          const dx = Math.abs(e.nativeEvent.pageX - touchStartX.current);
          if (dx > 8) hasSwiped.current = true;
        }}
      >
        <TaskRow
          task={item}
          onPress={(task) => {
            if (!hasSwiped.current) onTaskPress?.(task);
          }}
          onCheckboxPress={() => swipeableRef.current?.openRight()}
        />
      </View>
    </ReanimatedSwipeable>
  );
}

export function TaskList({
  tasks,
  onEndReached,
  isLoadingMore,
  onTaskPress,
  onComplete,
}: TaskListProps) {
  const active = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  const data: ListItem[] = [
    ...active,
    ...(completed.length > 0
      ? [
          { _type: "section-header" as const, title: "Completed Tasks" },
          ...completed,
        ]
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

        const isActive = item.status !== "completed";
        if (isActive && onComplete) {
          return (
            <SwipeableTaskRow
              item={item}
              onTaskPress={onTaskPress}
              onComplete={onComplete}
            />
          );
        }

        return <TaskRow task={item} onPress={onTaskPress} />;
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
