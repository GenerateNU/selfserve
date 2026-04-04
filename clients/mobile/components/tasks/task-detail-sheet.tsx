import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import {
  TASK_ASSIGNMENT_STATE,
  type TaskAssignmentState,
} from "@/constants/tasks";
import type { Task } from "@/types/tasks";

const primary = "#004FC5";

type TaskDetailSheetProps = {
  task: Task | null;
  listVariant: TaskAssignmentState;
  onDismiss: () => void;
  onStart: (task: Task) => void;
  onClaim: (task: Task) => void;
  onMarkDone: (task: Task) => void;
  onDrop: (task: Task) => void;
  onFindCover: (task: Task) => void;
};

export const TaskDetailSheet = forwardRef<
  BottomSheetModal,
  TaskDetailSheetProps
>(function TaskDetailSheet(
  {
    task,
    listVariant,
    onDismiss,
    onStart,
    onClaim,
    onMarkDone,
    onDrop,
    onFindCover,
  },
  ref,
) {
  const snapPoints = useMemo(() => ["50%", "90%"], []);

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

  const assigned = listVariant === TASK_ASSIGNMENT_STATE.ASSIGNED;
  const st = (task?.status ?? "").toLowerCase();

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
      handleIndicatorStyle={{ backgroundColor: "#ccc" }}
    >
      <BottomSheetScrollView className="flex-1 px-5 pb-10">
        {!task ? (
          <Text className="text-gray-500">No task selected</Text>
        ) : (
          <>
            <Text className="text-xl font-bold text-gray-900">
              {task.title}
            </Text>

            <View className="mt-3 gap-1">
              <Text className="text-sm text-gray-700">
                <Text className="text-gray-500">Priority:</Text> {task.priority}
              </Text>
              <Text className="text-sm text-gray-700">
                <Text className="text-gray-500">Department:</Text>{" "}
                {task.department}
              </Text>
              <Text className="text-sm text-gray-700">
                <Text className="text-gray-500">Location:</Text> {task.location}
              </Text>
              {task.dueTime ? (
                <Text className="text-sm text-gray-700">
                  <Text className="text-gray-500">Due:</Text> {task.dueTime}
                </Text>
              ) : null}
              <Text className="text-sm text-gray-700">
                <Text className="text-gray-500">Status:</Text> {task.status}
              </Text>
            </View>

            {task.description ? (
              <Text className="text-sm text-gray-600 mt-4">
                {task.description}
              </Text>
            ) : null}

            <View className="mt-6 gap-3">
              {assigned ? (
                <>
                  {st === "assigned" ? (
                    <Pressable
                      onPress={() => onStart(task)}
                      className="rounded-lg py-3 items-center"
                      style={{ backgroundColor: primary }}
                    >
                      <Text className="text-white font-semibold">Start</Text>
                    </Pressable>
                  ) : null}

                  {st === "assigned" ? (
                    <Pressable
                      onPress={() => onFindCover(task)}
                      className="py-2"
                    >
                      <Text
                        className="text-center text-sm"
                        style={{ color: primary }}
                      >
                        Find a Cover
                      </Text>
                    </Pressable>
                  ) : null}

                  {st === "in progress" ? (
                    <Pressable
                      onPress={() => onMarkDone(task)}
                      className="rounded-lg py-3 items-center bg-emerald-600"
                    >
                      <Text className="text-white font-semibold">
                        Mark done
                      </Text>
                    </Pressable>
                  ) : null}

                  {st === "in progress" ? (
                    <Pressable onPress={() => onDrop(task)} className="py-2">
                      <Text className="text-center text-sm text-red-600">
                        Drop task
                      </Text>
                    </Pressable>
                  ) : null}

                  {st === "completed" ? (
                    <Text className="text-center text-gray-500 text-sm py-2">
                      This task is completed.
                    </Text>
                  ) : null}
                </>
              ) : (
                <Pressable
                  onPress={() => onClaim(task)}
                  className="rounded-lg py-3 items-center border-2"
                  style={{ borderColor: primary }}
                >
                  <Text className="font-semibold" style={{ color: primary }}>
                    Claim Task
                  </Text>
                </Pressable>
              )}
            </View>

            <Text className="text-base font-semibold text-gray-900 mt-8 mb-2">
              Activity
            </Text>
            <View className="border border-[#E5E9ED] rounded-lg p-3">
              <Text className="text-sm text-gray-500">
                Activity log coming soon.
              </Text>
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
