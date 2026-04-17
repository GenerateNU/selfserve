import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  Clock,
  Check,
} from "lucide-react-native";
import { Colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type RoomSort = "ascending" | "descending" | "urgency";

export const DEFAULT_ROOM_SORT: RoomSort = "ascending";

type RoomSortSheetProps = {
  visible: boolean;
  sort: RoomSort;
  onSelect: (sort: RoomSort) => void;
  onClose: () => void;
};

const SORT_OPTIONS: {
  value: RoomSort;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  { value: "ascending", label: "Ascending", Icon: ArrowUpNarrowWide },
  { value: "descending", label: "Descending", Icon: ArrowDownNarrowWide },
  { value: "urgency", label: "Urgency", Icon: Clock },
];

export function RoomSortSheet({
  visible,
  sort,
  onSelect,
  onClose,
}: RoomSortSheetProps) {
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
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            transform: [{ translateY }],
          }}
          onStartShouldSetResponder={() => true}
        >
          {/* Drag handle */}
          <View
            {...panResponder.panHandlers}
            className="items-center pt-3 pb-2"
          >
            <View className="w-11 h-1 rounded-full bg-stroke-subtle" />
          </View>

          {/* Title */}
          <View className="px-6 py-4">
            <Text className="text-[15px] text-black tracking-tight">
              Sort by
            </Text>
          </View>

          {/* Sort options */}
          <View>
            {SORT_OPTIONS.map(({ value, label, Icon }) => {
              const selected = sort === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    onSelect(value);
                    close();
                  }}
                  className="flex-row items-center justify-between px-6 py-4"
                  style={selected ? { backgroundColor: "#f3f6f4" } : undefined}
                >
                  <View className="flex-row items-center gap-2">
                    <Icon size={14} color={Colors.light.textDefault} />
                    <Text className="text-[15px] text-black tracking-tight">
                      {label}
                    </Text>
                  </View>
                  {selected && (
                    <Check size={14} color={Colors.light.textDefault} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="h-12" />
        </Animated.View>
      </View>
    </Modal>
  );
}
