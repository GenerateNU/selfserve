import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { TASK_ASSIGNMENT_STATE } from "@/constants/tasks";
import type { Task } from "@/types/tasks";

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
      />
    ),
    [],
  );

  const assigned = variant === TASK_ASSIGNMENT_STATE.ASSIGNED;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["55%", "88%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView className="px-4 pt-2 pb-8">
        {!task ? null : (
          <>
            <Text className="text-xl font-bold">{task.title}</Text>
            <Text className="text-sm text-gray-600 mt-1">
              {task.priority} · {task.department} · {task.location}
            </Text>
            {task.dueTime ? (
              <Text className="text-sm text-gray-500 mt-1">
                Due {task.dueTime}
              </Text>
            ) : null}
            {task.description ? (
              <Text className="text-sm text-gray-700 mt-3">
                {task.description}
              </Text>
            ) : null}

            <View className="mt-6 gap-3">
              {assigned && task.status === "assigned" ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onStart(task.id)}
                  className="bg-blue-600 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">Start</Text>
                </Pressable>
              ) : null}
              {assigned && task.status === "in progress" ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onComplete(task.id)}
                  className="bg-blue-600 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">Mark done</Text>
                </Pressable>
              ) : null}
              {assigned &&
              (task.status === "assigned" || task.status === "in progress") ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onDrop(task.id)}
                  className="border border-gray-300 rounded-xl py-3 items-center"
                >
                  <Text className="text-gray-800 font-semibold">Drop task</Text>
                </Pressable>
              ) : null}
              {!assigned ? (
                <Pressable
                  disabled={busy}
                  onPress={() => onClaim(task.id)}
                  className="bg-white border border-gray-300 rounded-xl py-3 items-center"
                >
                  <Text className="text-black font-semibold">Claim task</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
