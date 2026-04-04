import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  TASK_FILTER_DEPARTMENTS,
  TASK_FILTER_PRIORITIES,
  TASK_FILTER_STATUS_MY,
  TASK_FILTER_STATUS_UNASSIGNED,
  TAB,
  type TabName,
} from "@/constants/tasks";
import type { TasksFilterState } from "@/types/tasks";

type TaskFilterSheetProps = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  activeTab: TabName;
  applied: TasksFilterState;
  onApply: (next: TasksFilterState) => void;
};

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
      className={`px-3 py-2 rounded-full border mr-2 mb-2 ${
        selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
      }`}
    >
      <Text
        className={selected ? "text-white text-sm" : "text-gray-800 text-sm"}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TaskFilterSheet({
  sheetRef,
  activeTab,
  applied,
  onApply,
}: TaskFilterSheetProps) {
  const [draft, setDraft] = useState<TasksFilterState>(applied);

  const statusOptions = useMemo(
    () =>
      activeTab === TAB.MY_TASKS
        ? TASK_FILTER_STATUS_MY
        : TASK_FILTER_STATUS_UNASSIGNED,
    [activeTab],
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const openSync = () => setDraft({ ...applied });

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["75%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(i) => {
        if (i >= 0) openSync();
      }}
    >
      <BottomSheetScrollView className="flex-1 px-4 pt-2 pb-8">
        <Text className="text-lg font-bold mb-3">Filters</Text>

        <Text className="text-sm font-semibold text-gray-600 mb-2">
          Department
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {TASK_FILTER_DEPARTMENTS.map((d) => (
            <Chip
              key={d.value}
              label={d.label}
              selected={draft.department === d.value}
              onPress={() =>
                setDraft((s) => ({
                  ...s,
                  department: s.department === d.value ? undefined : d.value,
                }))
              }
            />
          ))}
        </View>

        <Text className="text-sm font-semibold text-gray-600 mb-2">
          Priority
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {TASK_FILTER_PRIORITIES.map((p) => (
            <Chip
              key={p.value}
              label={p.label}
              selected={draft.priority === p.value}
              onPress={() =>
                setDraft((s) => ({
                  ...s,
                  priority: s.priority === p.value ? undefined : p.value,
                }))
              }
            />
          ))}
        </View>

        <Text className="text-sm font-semibold text-gray-600 mb-2">Status</Text>
        <View className="flex-row flex-wrap mb-6">
          {statusOptions.map((s) => (
            <Chip
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

        <Pressable
          onPress={() => {
            onApply(draft);
            sheetRef.current?.dismiss();
          }}
          className="bg-blue-600 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold">Apply</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
