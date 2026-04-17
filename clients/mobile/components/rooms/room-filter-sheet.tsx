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
import { X } from "lucide-react-native";
import { Colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type RoomStatusFilter = "occupied" | "vacant" | "open-tasks";

export type RoomAttributeFilter = "standard" | "deluxe" | "suite" | "accessible";

export type RoomAdvancedFilter = "arrivals-today" | "departures-today";

export type RoomFilters = {
  status: RoomStatusFilter[];
  attributes: RoomAttributeFilter[];
  advanced: RoomAdvancedFilter[];
};

export const EMPTY_ROOM_FILTERS: RoomFilters = {
  status: [],
  attributes: [],
  advanced: [],
};

type RoomFilterSheetProps = {
  visible: boolean;
  filters: RoomFilters;
  onApply: (filters: RoomFilters) => void;
  onClose: () => void;
};

const STATUS_OPTIONS: { value: RoomStatusFilter; label: string }[] = [
  { value: "occupied", label: "Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "open-tasks", label: "Open Tasks" },
];

const ATTRIBUTE_OPTIONS: { value: RoomAttributeFilter; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "accessible", label: "Accessible" },
];

const ADVANCED_OPTIONS: { value: RoomAdvancedFilter; label: string }[] = [
  { value: "arrivals-today", label: "Arrivals Today" },
  { value: "departures-today", label: "Departures Today" },
];

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded border ${
        selected ? "bg-bg-selected border-primary" : "bg-white border-input-border"
      }`}
    >
      <Text
        className={`text-[14px] leading-5 ${
          selected ? "text-primary" : "text-text-secondary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-[12px] text-text-subtle">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

export function RoomFilterSheet({
  visible,
  filters,
  onApply,
  onClose,
}: RoomFilterSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [draft, setDraft] = useState<RoomFilters>(filters);

  useEffect(() => {
    if (visible) {
      setDraft(filters);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
      }).start();
    }
  }, [visible, filters, translateY]);

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

  const allSelected: { label: string; onRemove: () => void }[] = [
    ...draft.status.map((v) => ({
      label: STATUS_OPTIONS.find((o) => o.value === v)!.label,
      onRemove: () =>
        setDraft((d) => ({ ...d, status: d.status.filter((s) => s !== v) })),
    })),
    ...draft.attributes.map((v) => ({
      label: ATTRIBUTE_OPTIONS.find((o) => o.value === v)!.label,
      onRemove: () =>
        setDraft((d) => ({
          ...d,
          attributes: d.attributes.filter((a) => a !== v),
        })),
    })),
    ...draft.advanced.map((v) => ({
      label: ADVANCED_OPTIONS.find((o) => o.value === v)!.label,
      onRemove: () =>
        setDraft((d) => ({
          ...d,
          advanced: d.advanced.filter((a) => a !== v),
        })),
    })),
  ];

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
            maxHeight: SCREEN_HEIGHT * 0.9,
            transform: [{ translateY }],
          }}
          onStartShouldSetResponder={() => true}
        >
          {/* Drag handle */}
          <View {...panResponder.panHandlers} className="items-center pt-3 pb-2">
            <View className="w-11 h-1 rounded-full bg-stroke-subtle" />
          </View>

          {/* Scrollable filter content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, gap: 20 }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-medium text-black tracking-tight">
                All Filters
              </Text>
              <Pressable onPress={() => setDraft(EMPTY_ROOM_FILTERS)}>
                <Text className="text-[15px] text-text-subtle tracking-tight">
                  Reset
                </Text>
              </Pressable>
            </View>

            {/* Filter sections */}
            <FilterSection title="Status">
              {STATUS_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={draft.status.includes(opt.value)}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      status: toggle(d.status, opt.value),
                    }))
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="Room Attributes">
              {ATTRIBUTE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={draft.attributes.includes(opt.value)}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      attributes: toggle(d.attributes, opt.value),
                    }))
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="Advanced">
              {ADVANCED_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={draft.advanced.includes(opt.value)}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      advanced: toggle(d.advanced, opt.value),
                    }))
                  }
                />
              ))}
            </FilterSection>
          </ScrollView>

          {/* Footer */}
          <View>
            {/* Selected filters row */}
            <View className="border-b border-stroke-subtle px-6 py-3">
              <Text className="text-[12px] text-text-subtle">
                Selected Filters
              </Text>
            </View>
            <View className="flex-row items-center px-6 py-3 min-h-[56px]">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 4, flexDirection: "row", alignItems: "center" }}
              >
                {allSelected.map(({ label, onRemove }) => (
                  <Pressable
                    key={label}
                    onPress={onRemove}
                    className="flex-row items-center gap-2 bg-bg-selected px-2 py-1 rounded"
                  >
                    <Text className="text-[14px] text-primary">{label}</Text>
                    <X size={8} color={Colors.light.tabBarActive} />
                  </Pressable>
                ))}
              </ScrollView>
              {allSelected.length > 0 && (
                <Pressable
                  onPress={() => setDraft(EMPTY_ROOM_FILTERS)}
                  className="ml-2"
                >
                  <Text className="text-[15px] text-text-subtle tracking-tight">
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3 border-t border-stroke-subtle px-6 pt-3 pb-12">
              <Pressable
                onPress={close}
                className="flex-1 items-center justify-center py-[10px] rounded"
              >
                <Text className="text-[14px] leading-5 text-primary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onApply(draft);
                  close();
                }}
                className="flex-1 items-center justify-center bg-primary py-[10px] rounded"
              >
                <Text className="text-[14px] leading-5 text-white">
                  Apply Filters
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
