import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";

import type { RequestFeedItem } from "@shared/api/requests";

type DetailRowProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-1.5">
        <Feather name={icon} size={14} color={Colors.light.icon} />
        <Text className="text-base text-text-subtle tracking-tight">
          {label}
        </Text>
      </View>
      <Text className="text-base text-text-default tracking-tight">
        {value}
      </Text>
    </View>
  );
}

function formatLocation(roomNumber?: number | null): string {
  return roomNumber != null ? `Room ${roomNumber}` : "—";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = date
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  return isToday
    ? `Today at ${time}`
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
// Sheet starts showing the bottom 58% of the screen
const PARTIAL_OFFSET = Math.round(SCREEN_HEIGHT * 0.42);
const SNAP_UP_THRESHOLD = 80;
const SNAP_DOWN_THRESHOLD = 80;

type TaskDetailSheetProps = {
  task: RequestFeedItem | null;
  onClose: () => void;
  onComplete?: (taskId: string) => void;
};

export function TaskDetailSheet({ task, onClose, onComplete }: TaskDetailSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isFullScreenRef = useRef(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const insets = useSafeAreaInsets();

  // Animate sheet in when a new task opens
  useEffect(() => {
    if (task) {
      translateY.setValue(SCREEN_HEIGHT);
      setIsFullScreen(false);
      isFullScreenRef.current = false;
      Animated.spring(translateY, {
        toValue: PARTIAL_OFFSET,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
      }).start();
    }
  }, [task, translateY]);

  function snapToFull() {
    isFullScreenRef.current = true;
    setIsFullScreen(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 28,
      stiffness: 280,
    }).start();
  }

  function snapToPartial() {
    isFullScreenRef.current = false;
    setIsFullScreen(false);
    Animated.spring(translateY, {
      toValue: PARTIAL_OFFSET,
      useNativeDriver: true,
      damping: 28,
      stiffness: 280,
    }).start();
  }

  function close() {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      isFullScreenRef.current = false;
      setIsFullScreen(false);
      onClose();
    });
  }

  // PanResponder for the drag handle (partial mode)
  const handlePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 3,
      onPanResponderMove: (_, { dy }) => {
        const base = isFullScreenRef.current ? 0 : PARTIAL_OFFSET;
        const next = base + dy;
        translateY.setValue(Math.max(0, next));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (isFullScreenRef.current) {
          if (dy > SNAP_DOWN_THRESHOLD || vy > 0.5) {
            snapToPartial();
          } else {
            snapToFull();
          }
        } else {
          if (dy < -SNAP_UP_THRESHOLD || vy < -0.5) {
            snapToFull();
          } else if (dy > SNAP_DOWN_THRESHOLD || vy > 0.5) {
            close();
          } else {
            snapToPartial();
          }
        }
      },
    }),
  ).current;

  if (!task) return null;

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <View style={{ flex: 1 }}>
        {/* Dimmed backdrop — tapping closes the sheet */}
        <Pressable className="absolute inset-0 bg-black/40" onPress={close} />

        {/* Sheet panel */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: SCREEN_HEIGHT,
              backgroundColor: Colors.light.white,
              borderTopLeftRadius: isFullScreen ? 0 : 24,
              borderTopRightRadius: isFullScreen ? 0 : 24,
              transform: [{ translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {isFullScreen ? (
            /* Full-screen top nav bar */
            <View style={{ paddingTop: insets.top }}>
              <View
                {...handlePan.panHandlers}
                className="flex-row items-center justify-between px-6 pt-3 pb-2 h-14"
              >
                <Pressable
                  onPress={snapToPartial}
                  className="flex-row items-center gap-2.5 flex-1"
                  hitSlop={8}
                >
                  <Feather name="chevron-left" size={22} color={Colors.light.text} />
                  <Text className="text-2xl font-bold text-black tracking-tight">
                    Tasks
                  </Text>
                </Pressable>
                <View className="flex-row gap-1">
                  <View className="w-9 h-9 items-center justify-center rounded">
                    <Feather name="search" size={18} color={Colors.light.text} />
                  </View>
                  <View className="w-9 h-9 items-center justify-center rounded">
                    <Feather name="sliders" size={18} color={Colors.light.text} />
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Drag handle for partial mode */
            <View {...handlePan.panHandlers} className="items-center pt-4 pb-3">
              <View className="w-11 h-1 rounded-full bg-text-disabled" />
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: isFullScreen ? 8 : 20,
              paddingBottom: insets.bottom + 48,
            }}
          >
            {/* Task title */}
            <Text className="text-2xl font-bold text-text-default tracking-tight mb-6">
              {task.name}
            </Text>

            {/* Detail rows */}
            <View className="gap-4 mb-6">
              <DetailRow
                icon="clipboard"
                label="Task Type"
                value={capitalize(task.request_type)}
              />
              <DetailRow
                icon="clock"
                label="Deadline"
                value={formatTime(task.created_at)}
              />
              <DetailRow
                icon="flag"
                label="Priority"
                value={capitalize(task.priority)}
              />
              <DetailRow
                icon="map-pin"
                label="Location"
                value={formatLocation(task.room_number)}
              />
              {task.request_category ? (
                <DetailRow
                  icon="home"
                  label="Department"
                  value={task.request_category}
                />
              ) : null}
            </View>

            {/* Description */}
            {task.description ? (
              <View className="gap-1 mb-6">
                <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                  Description
                </Text>
                <Text className="text-[15px] text-text-default tracking-tight leading-snug">
                  {task.description}
                </Text>
              </View>
            ) : null}

            {/* Activity — visible only in full-screen state */}
            {isFullScreen ? (
              <View className="gap-1 mb-6">
                <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                  Activity
                </Text>
                <Text className="text-[15px] text-text-disabled tracking-tight">
                  No activity yet
                </Text>
              </View>
            ) : null}

            {/* Mark as Done */}
            {task.status !== "completed" ? (
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onComplete?.(task.id);
                  close();
                }}
                className="bg-primary rounded items-center justify-center py-2.5 w-full"
              >
                <Text className="text-white text-[14px] leading-5">
                  Mark as Done
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
