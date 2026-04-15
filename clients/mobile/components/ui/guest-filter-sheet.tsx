import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { ChevronDown, ChevronUp, Check } from "lucide-react-native";
import type {
  BookingStatus,
  RequestSort,
  FloorSort,
  AssistanceFilter,
} from "@shared";
import { Colors } from "@/constants/theme";

export interface GuestFilterState {
  status: BookingStatus[];
  requestSort: RequestSort | null;
  floorSort: FloorSort | null;
  assistance: AssistanceFilter[];
  floors: number[];
}

interface GuestFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: GuestFilterState;
  onFiltersChange: (filters: GuestFilterState) => void;
  floorOptions: number[];
  onShowResults: () => void;
  onClearAll: () => void;
}

type Update = (patch: Partial<GuestFilterState>) => void;

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

interface SectionFilterProps {
  filters: GuestFilterState;
  update: Update;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.86;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.97;
const CLOSE_THRESHOLD = DEFAULT_HEIGHT * 0.65;

function Section({ title, children }: SectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="border-b border-stroke-subtle">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between px-[5vw] py-[2vh]"
      >
        <Text className="text-sm font-medium text-text-default">{title}</Text>
        {expanded ? (
          <ChevronUp size={16} color={Colors.light.textDefault} />
        ) : (
          <ChevronDown size={16} color={Colors.light.textDefault} />
        )}
      </Pressable>
      {expanded && <View className="px-[5vw] pb-[2vh]">{children}</View>}
    </View>
  );
}

function CheckboxRow({
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
      className="flex-row items-center gap-3 py-[1vh]"
    >
      <View
        className={`w-5 h-5 rounded border items-center justify-center ${
          selected
            ? "bg-primary border-primary"
            : "bg-white border-stroke-subtle"
        }`}
      >
        {selected && <Check size={12} color={Colors.light.white} />}
      </View>
      <Text
        className={`text-sm ${selected ? "text-primary font-medium" : "text-text-default"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RadioRow({
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
      className="flex-row items-center gap-3 py-[1vh]"
    >
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          selected ? "border-primary" : "border-stroke-subtle"
        }`}
      >
        {selected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </View>
      <Text
        className={`text-sm ${selected ? "text-primary font-medium" : "text-text-default"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StatusSection({ filters, update }: SectionFilterProps) {
  const toggle = (s: BookingStatus) => {
    const next = filters.status.includes(s)
      ? filters.status.filter((x) => x !== s)
      : [...filters.status, s];
    update({ status: next });
  };

  return (
    <Section title="Guest Status">
      <CheckboxRow
        label="Active (at least 1 active booking)"
        selected={filters.status.includes("active")}
        onPress={() => toggle("active")}
      />
      <CheckboxRow
        label="Inactive (no active bookings)"
        selected={filters.status.includes("inactive")}
        onPress={() => toggle("inactive")}
      />
    </Section>
  );
}

function RequestsSection({ filters, update }: SectionFilterProps) {
  const toggle = (sort: RequestSort) =>
    update({ requestSort: filters.requestSort === sort ? null : sort });

  return (
    <Section title="Requests">
      <View className="flex-row gap-[4vw]">
        <RadioRow
          label="High to Low"
          selected={filters.requestSort === "high_to_low"}
          onPress={() => toggle("high_to_low")}
        />
        <RadioRow
          label="Low to High"
          selected={filters.requestSort === "low_to_high"}
          onPress={() => toggle("low_to_high")}
        />
        <RadioRow
          label="Urgent"
          selected={filters.requestSort === "urgent"}
          onPress={() => toggle("urgent")}
        />
      </View>
    </Section>
  );
}

function AssistanceSection({ filters, update }: SectionFilterProps) {
  const toggle = (a: AssistanceFilter) => {
    const next = filters.assistance.includes(a)
      ? filters.assistance.filter((x) => x !== a)
      : [...filters.assistance, a];
    update({ assistance: next });
  };

  const options: { value: AssistanceFilter; label: string }[] = [
    { value: "accessibility", label: "Accessibility" },
    { value: "dietary", label: "Dietary" },
    { value: "medical", label: "Medical" },
  ];

  return (
    <Section title="Specific Assistance">
      <View className="flex-row flex-wrap gap-x-[8vw]">
        {options.map((a) => (
          <CheckboxRow
            key={a.value}
            label={a.label}
            selected={filters.assistance.includes(a.value)}
            onPress={() => toggle(a.value)}
          />
        ))}
      </View>
    </Section>
  );
}

function LocationSection({
  filters,
  update,
  floorOptions,
}: SectionFilterProps & { floorOptions: number[] }) {
  const [floorSearch, setFloorSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(floorSearch), 300);
    return () => clearTimeout(timer);
  }, [floorSearch]);

  const toggleFloor = (f: number) => {
    const next = filters.floors.includes(f)
      ? filters.floors.filter((x) => x !== f)
      : [...filters.floors, f];
    update({ floors: next });
  };

  const toggleFloorSort = (sort: FloorSort) =>
    update({ floorSort: filters.floorSort === sort ? null : sort });

  const filtered = floorOptions.filter((f) =>
    debouncedSearch === "" ? true : f.toString().includes(debouncedSearch),
  );

  return (
    <Section title="Location">
      <View className="flex-row items-center bg-white border border-stroke-subtle rounded-xl px-3 mb-[1.5vh]">
        <TextInput
          value={floorSearch}
          onChangeText={setFloorSearch}
          placeholder="Search..."
          placeholderTextColor={Colors.light.placeholder}
          className="flex-1 py-[1.2vh] text-sm text-text-default"
        />
      </View>

      <View className="border border-stroke-subtle rounded-xl overflow-hidden mb-[1.5vh] max-h-[20vh]">
        <ScrollView nestedScrollEnabled>
          {filtered.map((f, idx) => (
            <View
              key={f}
              className={
                idx < filtered.length - 1 ? "border-b border-stroke-subtle" : ""
              }
            >
              <Pressable
                onPress={() => toggleFloor(f)}
                className={`flex-row items-center gap-3 px-[4vw] py-[1.2vh] ${
                  filters.floors.includes(f) ? "bg-card" : "bg-white"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded border items-center justify-center ${
                    filters.floors.includes(f)
                      ? "bg-primary border-primary"
                      : "bg-white border-stroke-subtle"
                  }`}
                >
                  {filters.floors.includes(f) && (
                    <Check size={12} color={Colors.light.white} />
                  )}
                </View>
                <Text
                  className={`text-sm ${
                    filters.floors.includes(f)
                      ? "text-primary font-medium"
                      : "text-text-default"
                  }`}
                >
                  Floor {f}
                </Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="flex-row gap-[6vw]">
        <RadioRow
          label="Ascending Floors"
          selected={filters.floorSort === "ascending"}
          onPress={() => toggleFloorSort("ascending")}
        />
        <RadioRow
          label="Descending Floors"
          selected={filters.floorSort === "descending"}
          onPress={() => toggleFloorSort("descending")}
        />
      </View>
    </Section>
  );
}

export function GuestFilterSheet({
  visible,
  onClose,
  filters,
  onFiltersChange,
  floorOptions,
  onShowResults,
  onClearAll,
}: GuestFilterSheetProps) {
  const sheetHeight = useRef(new Animated.Value(DEFAULT_HEIGHT)).current;
  const lastHeight = useRef(DEFAULT_HEIGHT);

  useEffect(() => {
    if (visible) {
      sheetHeight.setValue(DEFAULT_HEIGHT);
      lastHeight.current = DEFAULT_HEIGHT;
    }
  }, [visible, sheetHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 3,
      onPanResponderMove: (_, { dy }) => {
        const newH = lastHeight.current - dy;
        sheetHeight.setValue(Math.min(MAX_HEIGHT, Math.max(80, newH)));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        const newH = lastHeight.current - dy;
        if (vy > 0.5 || newH < CLOSE_THRESHOLD) {
          onClose();
        } else {
          const target =
            newH > (DEFAULT_HEIGHT + MAX_HEIGHT) / 2
              ? MAX_HEIGHT
              : DEFAULT_HEIGHT;
          Animated.spring(sheetHeight, {
            toValue: target,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
          lastHeight.current = target;
        }
      },
    }),
  ).current;

  const update: Update = (patch) => onFiltersChange({ ...filters, ...patch });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose} />
      <Animated.View
        style={{ height: sheetHeight }}
        className="bg-white rounded-t-2xl overflow-hidden"
      >
        <View {...panResponder.panHandlers} className="items-center pt-3 pb-2">
          <View className="w-10 h-1 rounded-full bg-stroke-subtle" />
        </View>

        <View className="px-[5vw] pb-[1.5vh]">
          <Text className="text-2xl font-bold text-text-default">Filters</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <StatusSection filters={filters} update={update} />
          <RequestsSection filters={filters} update={update} />
          <AssistanceSection filters={filters} update={update} />
          <LocationSection
            filters={filters}
            update={update}
            floorOptions={floorOptions}
          />
        </ScrollView>

        <View className="px-[5vw] py-[2vh] border-t border-stroke-subtle gap-[1.5vh]">
          <Pressable
            onPress={() => {
              onShowResults();
              onClose();
            }}
            className="bg-primary rounded-xl py-[1.8vh] items-center"
          >
            <Text className="text-white font-semibold text-sm">
              Show Results
            </Text>
          </Pressable>
          <Pressable onPress={onClearAll} className="items-center py-[1vh]">
            <Text className="text-sm text-primary font-medium">Clear all</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}
