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

import type { RequestFeedSort } from "@shared/api/requests";

import { DepartmentSection } from "./department-section";
import { LocationSection } from "./location-section";
import { PrioritySection } from "./priority-section";
import { SortBySection } from "./sort-by-section";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type TaskFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  sort: RequestFeedSort;
  onSortChange: (sort: RequestFeedSort) => void;
};

export function TaskFilterSheet({
  visible,
  onClose,
  sort,
  onSortChange,
}: TaskFilterSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const insets = useSafeAreaInsets();

  const [expanded, setExpanded] = useState({
    sortBy: false,
    priority: false,
    department: false,
    location: false,
  });

  function toggle(key: keyof typeof expanded) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
      }).start();
    }
  }, [visible, translateY]);

  function close() {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 3,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 80 || vy > 0.5) {
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 28,
            stiffness: 280,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable className="absolute inset-0 bg-black/40" onPress={close} />

        <Animated.View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: SCREEN_HEIGHT * 0.9,
            transform: [{ translateY }],
          }}
          onStartShouldSetResponder={() => true}
        >
          {/* Drag handle */}
          <View
            {...panResponder.panHandlers}
            className="items-center pt-4 pb-3"
          >
            <View className="w-11 h-1 rounded-full bg-text-disabled" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: insets.bottom + 48,
              gap: 24,
            }}
          >
            {/* Title */}
            <Text className="text-2xl font-medium text-[#464646] tracking-tight">
              Filters
            </Text>

            {/* Filter sections */}
            <SortBySection
              expanded={expanded.sortBy}
              onToggle={() => toggle("sortBy")}
              sort={sort}
              onSortChange={onSortChange}
            />
            <PrioritySection
              expanded={expanded.priority}
              onToggle={() => toggle("priority")}
            />
            <DepartmentSection
              expanded={expanded.department}
              onToggle={() => toggle("department")}
            />
            <LocationSection
              expanded={expanded.location}
              onToggle={() => toggle("location")}
            />

            {/* Actions */}
            <View className="gap-2">
              <Pressable
                onPress={close}
                className="bg-primary rounded items-center justify-center py-2.5 w-full"
              >
                <Text className="text-white text-[14px] leading-5">
                  Show Results
                </Text>
              </Pressable>
              <Pressable
                onPress={close}
                className="items-center justify-center py-2.5 w-full"
              >
                <Text className="text-primary text-[14px] leading-5">
                  Clear all
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
