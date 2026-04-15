import { useEffect, useRef } from "react";
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
          <View {...panResponder.panHandlers} className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-stroke-subtle" />
          </View>

          {/* Title */}
          <View className="px-[5vw] pb-[1.5vh]">
            <Text className="text-2xl font-bold text-text-default">Filters</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <SortBySection sort={sort} onSortChange={onSortChange} />
            <PrioritySection />
            <DepartmentSection />
            <LocationSection />
          </ScrollView>

          {/* Actions */}
          <View className="px-[5vw] py-[2vh] border-t border-stroke-subtle gap-[1.5vh]">
            <Pressable
              onPress={close}
              className="bg-primary rounded-xl py-[1.8vh] items-center"
            >
              <Text className="text-white font-semibold text-sm">
                Show Results
              </Text>
            </Pressable>
            <Pressable onPress={close} className="items-center py-[1vh]">
              <Text className="text-sm text-primary font-medium">Clear all</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
