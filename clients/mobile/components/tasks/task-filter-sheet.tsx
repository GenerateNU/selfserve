import Feather from "@expo/vector-icons/Feather";
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Primitives ────────────────────────────────────────────────────────────────

function CheckedBox() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        backgroundColor: "#124425",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name="check" size={9} color="white" />
    </View>
  );
}

function UncheckedBox() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderWidth: 0.8,
        borderColor: "#2e2e2e",
        borderRadius: 4,
        opacity: 0.5,
      }}
    />
  );
}

function RadioSelected() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 0.8,
        borderColor: "#124425",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#124425",
        }}
      />
    </View>
  );
}

function RadioUnselected() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 0.8,
        borderColor: "#2e2e2e",
        opacity: 0.4,
      }}
    />
  );
}

// ─── Row items ─────────────────────────────────────────────────────────────────

function RadioItem({ label, selected }: { label: string; selected: boolean }) {
  return (
    <View className="flex-row items-center gap-1">
      {selected ? <RadioSelected /> : <RadioUnselected />}
      <Text
        className="text-[15px] tracking-tight"
        style={{ color: selected ? "#15502c" : "#040506" }}
      >
        {label}
      </Text>
    </View>
  );
}

function CheckboxItem({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1">
      {checked ? <CheckedBox /> : <UncheckedBox />}
      <Text
        className="text-[15px] tracking-tight"
        style={{ color: checked ? "#15502c" : "#040506" }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────────

type SectionHeaderProps = {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  customIcon?: React.ReactNode;
};

function SectionHeader({
  label,
  expanded,
  onToggle,
  icon,
  customIcon,
}: SectionHeaderProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between"
    >
      <View className="flex-row items-center gap-1.5">
        {customIcon ??
          (icon ? <Feather name={icon} size={14} color="#464646" /> : null)}
        <Text className="text-[15px] text-[#464646] tracking-tight">
          {label}
        </Text>
      </View>
      <View className="w-6 h-6 items-center justify-center">
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color="#464646"
        />
      </View>
    </Pressable>
  );
}

// ─── Sort By ────────────────────────────────────────────────────────────────────

function SortBySection({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Sort By"
        expanded={expanded}
        onToggle={onToggle}
        customIcon={
          <View style={{ width: 18, height: 16, alignItems: "center" }}>
            <Feather name="arrow-up" size={9} color="#464646" />
            <Feather name="arrow-down" size={9} color="#464646" />
          </View>
        }
      />
      {expanded && (
        <View className="flex-row justify-between px-1">
          <RadioItem label="Priority" selected />
          <RadioItem label="Newest" selected={false} />
          <RadioItem label="Oldest" selected={false} />
        </View>
      )}
    </View>
  );
}

// ─── Priority ───────────────────────────────────────────────────────────────────

function PrioritySection({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Priority"
        expanded={expanded}
        onToggle={onToggle}
        icon="flag"
      />
      {expanded && (
        <View className="flex-row justify-between px-1">
          <CheckboxItem label="High" checked />
          <CheckboxItem label="Medium" checked />
          <CheckboxItem label="Low" checked />
        </View>
      )}
    </View>
  );
}

// ─── Department ─────────────────────────────────────────────────────────────────

const DEPT_LEFT = ["Food & Beverage", "Front Office", "Housekeeping"];
const DEPT_RIGHT = ["Maintenance", "Management", "Security"];
const DEPT_CHECKED = new Set(["Food & Beverage", "Front Office"]);

function DepartmentSection({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Department"
        expanded={expanded}
        onToggle={onToggle}
        icon="home"
      />
      {expanded && (
        <View className="flex-row justify-between px-1">
          <View className="gap-1">
            {DEPT_LEFT.map((d) => (
              <CheckboxItem key={d} label={d} checked={DEPT_CHECKED.has(d)} />
            ))}
          </View>
          <View className="gap-1">
            {DEPT_RIGHT.map((d) => (
              <CheckboxItem key={d} label={d} checked={DEPT_CHECKED.has(d)} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Location (Rooms) ────────────────────────────────────────────────────────────

const ROOMS = ["Room 101", "Room 102", "Room 201", "Room 202", "Room 301"];

function LocationSection({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Location"
        expanded={expanded}
        onToggle={onToggle}
        icon="map-pin"
      />
      {expanded && (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#aeaeae",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Search bar */}
          <View
            className="flex-row items-center gap-2 px-2 pt-2 pb-3"
            style={{ borderBottomWidth: 1, borderBottomColor: "#e5e9ed" }}
          >
            <View className="w-6 h-6 items-center justify-center">
              <Feather name="search" size={16} color="#464646" />
            </View>
            <Text className="text-xs font-bold text-black tracking-tight">
              Room:
            </Text>
          </View>
          {/* Room list */}
          {ROOMS.map((room) => (
            <View key={room} className="px-4 py-2">
              <Text className="text-xs text-black tracking-tight">{room}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Sheet ───────────────────────────────────────────────────────────────────────

type TaskFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function TaskFilterSheet({ visible, onClose }: TaskFilterSheetProps) {
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
    })
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
