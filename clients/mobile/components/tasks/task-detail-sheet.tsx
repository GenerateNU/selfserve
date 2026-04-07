import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { TASK_ASSIGNMENT_STATE } from "@/constants/tasks";
import type { Task } from "@/types/tasks";

/** Figma SelfServe task detail sheet — Primary */
const PRIMARY_BLUE = "#004FC5";
const LABEL_MUTED = "#A4A4A4";

type TaskDetailSheetProps = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  task: Task | null;
  variant: (typeof TASK_ASSIGNMENT_STATE)[keyof typeof TASK_ASSIGNMENT_STATE];
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onClaim: (id: string) => void;
  onDrop: (id: string) => void;
  busy: boolean;
};

function MetadataGlyph() {
  return (
    <View className="w-[19px] h-[19px] items-center justify-center">
      <View className="flex-row gap-[3px]">
        <View className="w-[3px] h-[3px] rounded-full bg-neutral-400" />
        <View className="w-[3px] h-[3px] rounded-full bg-neutral-400" />
      </View>
      <View className="flex-row gap-[3px] mt-[3px]">
        <View className="w-[3px] h-[3px] rounded-full bg-neutral-400" />
        <View className="w-[3px] h-[3px] rounded-full bg-neutral-400" />
      </View>
    </View>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center w-full">
      <View className="flex-row items-center gap-1 shrink-0">
        <MetadataGlyph />
        <Text
          className="text-sm leading-5"
          style={{ color: LABEL_MUTED }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <View className="flex-1 min-w-0 pl-5">
        <Text
          className="text-sm text-black text-right leading-5"
          numberOfLines={3}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export function TaskDetailSheet({
  sheetRef,
  task,
  variant,
  onStart,
  onComplete,
  onClaim,
  onDrop,
  busy,
}: TaskDetailSheetProps) {
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    [],
  );

  const assigned = variant === TASK_ASSIGNMENT_STATE.ASSIGNED;

  const onHistoryPress = useCallback(() => {
    Alert.alert(
      "Task history",
      "Activity history for this task is not available yet.",
    );
  }, []);

  const deadlineDisplay =
    task?.dueTime?.trim() && task.dueTime !== "—" ? task.dueTime : "Not set";

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["72%", "92%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: "#000000",
        width: 44,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
      }}
    >
      <BottomSheetScrollView
        className="flex-1 px-3 pt-1 pb-10"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {!task ? null : (
          <>
            <View className="flex-row items-start justify-between gap-3 pr-1">
              <Text className="flex-1 text-[20px] font-bold text-black leading-6">
                {task.title}
              </Text>
              <Pressable
                onPress={onHistoryPress}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Open task history"
                className="p-0.5"
              >
                <MaterialIcons name="history" size={24} color="#000000" />
              </Pressable>
            </View>

            <View className="mt-5 gap-4">
              <View className="gap-4">
                <MetadataRow label="Deadline" value={deadlineDisplay} />
                <MetadataRow label="Priority" value={task.priority} />
                <MetadataRow label="Location" value={task.location} />
                <MetadataRow label="Department" value={task.department} />
              </View>

              <View className="gap-1">
                <Text
                  className="text-sm leading-5"
                  style={{ color: LABEL_MUTED }}
                >
                  Description
                </Text>
                <Text className="text-sm text-black leading-5">
                  {task.description?.trim()
                    ? task.description
                    : "No description provided."}
                </Text>
              </View>
            </View>

            <View className="mt-6 gap-3 w-full max-w-[345px] self-center">
              {assigned && task.status === "assigned" ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onStart(task.id)}
                  className="w-full h-10 px-6 items-center justify-center rounded-lg active:opacity-90"
                  style={{ backgroundColor: PRIMARY_BLUE }}
                >
                  <Text className="text-sm text-white font-normal leading-5">
                    Start
                  </Text>
                </Pressable>
              ) : null}
              {assigned && task.status === "in progress" ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onComplete(task.id)}
                  className="w-full h-10 px-6 items-center justify-center rounded-lg active:opacity-90"
                  style={{ backgroundColor: PRIMARY_BLUE }}
                >
                  <Text className="text-sm text-white font-normal leading-5">
                    Mark done
                  </Text>
                </Pressable>
              ) : null}
              {assigned &&
              (task.status === "assigned" || task.status === "in progress") ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onDrop(task.id)}
                  className="w-full h-10 px-6 items-center justify-center rounded-lg bg-white border border-neutral-300 active:bg-neutral-50"
                >
                  <Text className="text-sm text-black font-normal leading-5">
                    Drop Task
                  </Text>
                </Pressable>
              ) : null}
              {!assigned ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onClaim(task.id)}
                  className="w-full h-11 px-6 items-center justify-center rounded-lg active:opacity-90"
                  style={{ backgroundColor: PRIMARY_BLUE }}
                >
                  <Text className="text-sm text-white font-normal leading-5">
                    Claim Task
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
