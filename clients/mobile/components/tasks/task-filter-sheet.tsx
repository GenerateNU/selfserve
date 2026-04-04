import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import {
  TAB,
  TASK_FILTER_DEPARTMENTS,
  TASK_FILTER_PRIORITIES,
  TASK_FILTER_STATUS_MY,
  TASK_FILTER_STATUS_UNASSIGNED,
  type TabName,
  type TaskViewMode,
} from "@/constants/tasks";
import type { TasksFilterState } from "@/types/tasks";

const primary = "#004FC5";

type TaskFilterSheetProps = {
  tab: TabName;
  draft: TasksFilterState;
  setDraft: React.Dispatch<React.SetStateAction<TasksFilterState>>;
  viewMode: TaskViewMode;
  setViewMode: (mode: TaskViewMode) => void;
  onApply: () => void;
};

function OptionChip({
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
      className={`px-3 py-2 rounded-full border ${
        selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
      }`}
    >
      <Text className={`${selected ? "text-white" : "text-gray-800"} text-sm`}>
        {label}
      </Text>
    </Pressable>
  );
}

export const TaskFilterSheet = forwardRef<
  BottomSheetModal,
  TaskFilterSheetProps
>(function TaskFilterSheet(
  { tab, draft, setDraft, viewMode, setViewMode, onApply },
  ref,
) {
  // Tall first snap so filters + Apply are visible without dragging higher first.
  const snapPoints = useMemo(() => ["90%", "95%"], []);
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const statusOptions =
    tab === TAB.MY_TASKS
      ? TASK_FILTER_STATUS_MY
      : TASK_FILTER_STATUS_UNASSIGNED;

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#ccc" }}
    >
      <BottomSheetScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="flex-row items-center justify-between pt-2">
          <Text className="text-xl font-bold text-gray-900">Filters</Text>
          <Pressable onPress={() => setDraft({})}>
            <Text className="text-sm" style={{ color: primary }}>
              Reset
            </Text>
          </Pressable>
        </View>

        <Text className="text-sm font-semibold text-gray-800 mt-6">
          Department
        </Text>
        <View className="flex-row flex-wrap gap-2 mt-2">
          {TASK_FILTER_DEPARTMENTS.map((d) => (
            <OptionChip
              key={d.value}
              label={d.label}
              selected={draft.department === d.value}
              onPress={() =>
                setDraft((prev) => ({
                  ...prev,
                  department: prev.department === d.value ? undefined : d.value,
                }))
              }
            />
          ))}
        </View>

        <Text className="text-sm font-semibold text-gray-800 mt-6">
          Priority
        </Text>
        <View className="flex-row flex-wrap gap-2 mt-2">
          {TASK_FILTER_PRIORITIES.map((p) => (
            <OptionChip
              key={p.value}
              label={p.label}
              selected={draft.priority === p.value}
              onPress={() =>
                setDraft((prev) => ({
                  ...prev,
                  priority: prev.priority === p.value ? undefined : p.value,
                }))
              }
            />
          ))}
        </View>

        <Text className="text-sm font-semibold text-gray-800 mt-6">Status</Text>
        <View className="flex-row flex-wrap gap-2 mt-2">
          {statusOptions.map((s) => (
            <OptionChip
              key={s.value}
              label={s.label}
              selected={draft.status === s.value}
              onPress={() =>
                setDraft((prev) => ({
                  ...prev,
                  status: prev.status === s.value ? undefined : s.value,
                }))
              }
            />
          ))}
        </View>

        <Text className="text-sm font-semibold text-gray-800 mt-6">View</Text>
        <View className="flex-row gap-2 mt-2">
          <OptionChip
            label="Default"
            selected={viewMode === "default"}
            onPress={() => setViewMode("default")}
          />
          <OptionChip
            label="Compact"
            selected={viewMode === "compact"}
            onPress={() => setViewMode("compact")}
          />
        </View>

        <Pressable
          onPress={onApply}
          className="rounded-lg py-3 items-center mt-8"
          style={{ backgroundColor: primary }}
        >
          <Text className="text-white font-semibold">Apply Filters</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
