import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { Colors } from "@/constants/theme";
import { AssigneePicker } from "@/components/tasks/assignee-picker";
import { DeadlinePicker } from "@/components/tasks/deadline-picker";
import { DepartmentPicker } from "@/components/tasks/department-picker";
import { PriorityPicker } from "@/components/tasks/priority-picker";
import { RoomPicker } from "@/components/tasks/room-picker";
import { getConfig } from "@shared/api/config";
import {
  REQUESTS_FEED_QUERY_KEY,
  useGetRequestById,
} from "@shared/api/requests";
import { usePutRequestId } from "@shared/api/generated/endpoints/requests/requests";
import { useGetDepartments, useGetUsersId } from "@shared";
import type {
  Department,
  MakeRequestPriority,
  RoomWithOptionalGuestBooking,
  User,
} from "@shared";
import type { RequestFeedItem } from "@shared/api/requests";

type RequestForm = {
  name: string;
  description: string;
  priority: MakeRequestPriority;
  deadline: Date | undefined;
  user_id: string | undefined;
  room_id: string | undefined;
  department_id: string | undefined;
};

type DetailRowProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-1.5">
        <Feather name={icon} size={14} color={Colors.light.icon} />
        <Text className="text-base text-text-subtle tracking-tight">
          {label}
        </Text>
      </View>
      <Text className="text-base text-text-default tracking-tight">
        {value}
      </Text>
    </View>
  );
}

function formatLocation(
  floor?: number | null,
  roomNumber?: number | null,
): string {
  if (floor != null && roomNumber != null)
    return `Floor ${floor}, Room ${roomNumber}`;
  if (roomNumber != null) return `Room ${roomNumber}`;
  return "—";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
// Sheet starts showing the bottom 58% of the screen
const PARTIAL_OFFSET = Math.round(SCREEN_HEIGHT * 0.42);
const SNAP_UP_THRESHOLD = 80;
const SNAP_DOWN_THRESHOLD = 80;

type TaskDetailSheetProps = {
  task: RequestFeedItem | null;
  onClose: () => void;
  onComplete?: (taskId: string) => void;
  onMarkPending?: (taskId: string) => void;
  onDropTask?: (taskId: string) => void;
};

export function TaskDetailSheet({
  task,
  onClose,
  onComplete,
  onMarkPending,
  onDropTask,
}: TaskDetailSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isFullScreenRef = useRef(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<RequestForm>({
    name: "",
    description: "",
    priority: "medium",
    deadline: undefined,
    user_id: undefined,
    room_id: undefined,
    department_id: undefined,
  });

  // Picker display objects — full objects needed by picker components; separate from form IDs
  const [pickers, setPickers] = useState<{
    assignee: User | undefined;
    room: RoomWithOptionalGuestBooking | undefined;
    department: Department | undefined;
  }>({ assignee: undefined, room: undefined, department: undefined });

  // Original snapshot — the task as it was when edit mode was entered
  const orig = useRef<RequestForm | null>(null);

  const assigneeInitializedRef = useRef(false);
  const roomDeadlineInitializedRef = useRef(false);
  const departmentInitializedRef = useRef(false);

  const { hotelId } = getConfig();

  // Fetch full request for edit pre-population (enabled whenever there's a task)
  const { data: fullRequest } = useGetRequestById(task?.id ?? null);

  // Fetch departments for pre-populating department picker
  const { data: departments } = useGetDepartments(
    isEditing ? hotelId : undefined,
  );

  // Fetch assignee user when there's a user_id
  const { data: initialAssigneeData } = useGetUsersId(task?.user_id ?? "", {
    query: { enabled: !!task?.user_id },
  });

  const { mutate: saveTask, isPending: isSaving } = usePutRequestId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ["request", task?.id] });
        close();
      },
    },
  });

  // Animate sheet in when a new task opens
  useEffect(() => {
    if (task) {
      translateY.setValue(SCREEN_HEIGHT);
      setIsFullScreen(false);
      isFullScreenRef.current = false;
      setIsEditing(false);
      Animated.spring(translateY, {
        toValue: PARTIAL_OFFSET,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
      }).start();
    }
  }, [task, translateY]);

  // Initialize edit state when entering edit mode
  useEffect(() => {
    if (isEditing && task) {
      assigneeInitializedRef.current = false;
      roomDeadlineInitializedRef.current = false;
      departmentInitializedRef.current = false;
      const initial: RequestForm = {
        name: task.name.trim(),
        description: (task.description ?? "").trim(),
        priority: (task.priority as MakeRequestPriority) ?? "medium",
        deadline: undefined,
        user_id: task.user_id ?? undefined,
        room_id: undefined,
        department_id: task.department_id ?? undefined,
      };
      setForm(initial);
      setPickers({ assignee: undefined, room: undefined, department: undefined });
      orig.current = { ...initial };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // Pre-populate department once departments list loads
  useEffect(() => {
    if (
      isEditing &&
      departments &&
      task?.department_id &&
      !departmentInitializedRef.current
    ) {
      const dept = departments.find((d) => d.id === task.department_id);
      if (dept) {
        departmentInitializedRef.current = true;
        setPickers((p) => ({ ...p, department: dept }));
      }
    }
  }, [isEditing, departments, task?.department_id]);

  // Pre-populate assignee once user data loads
  useEffect(() => {
    if (isEditing && initialAssigneeData && !assigneeInitializedRef.current) {
      assigneeInitializedRef.current = true;
      setPickers((p) => ({ ...p, assignee: initialAssigneeData }));
    }
  }, [isEditing, initialAssigneeData]);

  // Pre-populate room and deadline once full request loads
  useEffect(() => {
    if (isEditing && fullRequest && task && !roomDeadlineInitializedRef.current) {
      roomDeadlineInitializedRef.current = true;
      const room = fullRequest.room_id
        ? { id: fullRequest.room_id, room_number: task.room_number ?? undefined, floor: task.floor ?? undefined }
        : undefined;
      const deadline = fullRequest.scheduled_time
        ? new Date(fullRequest.scheduled_time)
        : undefined;
      setForm((f) => ({ ...f, room_id: fullRequest.room_id ?? undefined, deadline }));
      setPickers((p) => ({ ...p, room }));
      // Update orig so pre-population doesn't count as a change
      if (orig.current) {
        orig.current = { ...orig.current, room_id: fullRequest.room_id ?? undefined, deadline };
      }
    }
  }, [isEditing, fullRequest, task]);

  function enterEditMode() {
    setIsEditing(true);
    snapToFull();
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  const isDirty =
    isEditing &&
    orig.current !== null &&
    (form.name.trim() !== (orig.current.name ?? "") ||
      form.description.trim() !== (orig.current.description ?? "") ||
      form.priority !== orig.current.priority ||
      form.user_id !== orig.current.user_id ||
      form.room_id !== orig.current.room_id ||
      form.department_id !== orig.current.department_id ||
      form.deadline?.getTime() !== orig.current.deadline?.getTime());

  function handleSave() {
    if (!task || isSaving || !isDirty) return;
    saveTask({
      id: task.id,
      data: {
        name: form.name.trim() || undefined,
        description: form.description.trim() || undefined,
        priority: form.priority,
        department: form.department_id,
        user_id: form.user_id,
        room_id: form.room_id,
        scheduled_time: form.deadline?.toISOString(),
      },
    });
  }

  function snapToFull() {
    isFullScreenRef.current = true;
    setIsFullScreen(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 28,
      stiffness: 280,
    }).start();
  }

  function snapToPartial() {
    isFullScreenRef.current = false;
    setIsFullScreen(false);
    Animated.spring(translateY, {
      toValue: PARTIAL_OFFSET,
      useNativeDriver: true,
      damping: 28,
      stiffness: 280,
    }).start();
  }

  function close() {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      isFullScreenRef.current = false;
      setIsFullScreen(false);
      setIsEditing(false);
      onClose();
    });
  }

  // PanResponder for the drag handle (partial mode)
  const handlePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 3,
      onPanResponderMove: (_, { dy }) => {
        const base = isFullScreenRef.current ? 0 : PARTIAL_OFFSET;
        const next = base + dy;
        translateY.setValue(Math.max(0, next));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (isFullScreenRef.current) {
          if (dy > SNAP_DOWN_THRESHOLD || vy > 0.5) {
            snapToPartial();
          } else {
            snapToFull();
          }
        } else {
          if (dy < -SNAP_UP_THRESHOLD || vy < -0.5) {
            snapToFull();
          } else if (dy > SNAP_DOWN_THRESHOLD || vy > 0.5) {
            close();
          } else {
            snapToPartial();
          }
        }
      },
    }),
  ).current;

  if (!task) return null;

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <View style={{ flex: 1 }}>
        {/* Dimmed backdrop — tapping closes the sheet */}
        <Pressable className="absolute inset-0 bg-black/40" onPress={close} />

        {/* Sheet panel */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: SCREEN_HEIGHT,
              backgroundColor: Colors.light.white,
              borderTopLeftRadius: isFullScreen ? 0 : 24,
              borderTopRightRadius: isFullScreen ? 0 : 24,
              transform: [{ translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {isFullScreen ? (
            /* Full-screen top nav bar */
            <View style={{ paddingTop: insets.top }}>
              <View
                {...(isEditing ? {} : handlePan.panHandlers)}
                className="flex-row items-center justify-between px-6 pt-3 pb-2 h-14"
              >
                {isEditing ? (
                  <Pressable
                    onPress={cancelEdit}
                    className="flex-row items-center gap-2.5 flex-1"
                    hitSlop={8}
                  >
                    <Feather
                      name="chevron-left"
                      size={22}
                      color={Colors.light.text}
                    />
                    <Text className="text-2xl font-bold text-black tracking-tight">
                      Edit Task
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={snapToPartial}
                    className="flex-row items-center gap-2.5 flex-1"
                    hitSlop={8}
                  >
                    <Feather
                      name="chevron-left"
                      size={22}
                      color={Colors.light.text}
                    />
                    <Text className="text-2xl font-bold text-black tracking-tight">
                      Tasks
                    </Text>
                  </Pressable>
                )}
                {isEditing ? (
                  <Pressable
                    onPress={handleSave}
                    disabled={!isDirty || isSaving}
                    className={`px-3 h-9 items-center justify-center rounded bg-primary ${!isDirty ? "opacity-40" : ""}`}
                    hitSlop={8}
                  >
                    <Text className="text-white text-[14px] leading-5">
                      {isSaving ? "Saving…" : "Save"}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={enterEditMode}
                    className="w-9 h-9 items-center justify-center rounded"
                    hitSlop={8}
                  >
                    <Feather
                      name="edit-2"
                      size={18}
                      color={Colors.light.text}
                    />
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            /* Drag handle for partial mode */
            <View {...handlePan.panHandlers} className="items-center pt-4 pb-3">
              <View className="w-11 h-1 rounded-full bg-text-disabled" />
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: isFullScreen ? 8 : 20,
              paddingBottom: insets.bottom + 48,
            }}
          >
            {isEditing ? (
              /* Edit form */
              <View className="gap-6">
                {/* Task Name Input */}
                <View className="border border-stroke-subtle rounded p-2">
                  <TextInput
                    className="text-2xl font-bold text-text-default tracking-tight"
                    placeholder="Task Name"
                    placeholderTextColor={Colors.light.textSubtle}
                    value={form.name}
                    onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                    returnKeyType="done"
                  />
                </View>

                {/* Fields */}
                <View className="gap-4">
                  <PriorityPicker
                    value={form.priority}
                    onChange={(v) => setForm((f) => ({ ...f, priority: v ?? "medium" }))}
                  />

                  <DeadlinePicker
                    value={form.deadline}
                    onChange={(v) => setForm((f) => ({ ...f, deadline: v }))}
                  />

                  <AssigneePicker
                    value={pickers.assignee}
                    onChange={(v) => {
                      setPickers((p) => ({ ...p, assignee: v }));
                      setForm((f) => ({ ...f, user_id: v?.id }));
                    }}
                  />

                  <RoomPicker
                    value={pickers.room}
                    onChange={(v) => {
                      setPickers((p) => ({ ...p, room: v }));
                      setForm((f) => ({ ...f, room_id: v?.id }));
                    }}
                  />

                  <DepartmentPicker
                    hotelId={hotelId}
                    value={pickers.department}
                    onChange={(v) => {
                      setPickers((p) => ({ ...p, department: v }));
                      setForm((f) => ({ ...f, department_id: v?.id }));
                    }}
                  />

                  {/* Description */}
                  <View className="gap-1">
                    <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                      Description
                    </Text>
                    <TextInput
                      className="text-[15px] text-text-default tracking-tight leading-snug"
                      placeholder="Empty"
                      placeholderTextColor={Colors.light.textSubtle}
                      value={form.description}
                      onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
            ) : (
              /* View mode */
              <>
                {/* Task title */}
                <View className="flex-row items-start justify-between mb-6">
                  <Text className="text-2xl font-bold text-text-default tracking-tight flex-1 pr-2">
                    {task.name}
                  </Text>
                  {!isFullScreen && (
                    <Pressable
                      onPress={enterEditMode}
                      className="w-9 h-9 items-center justify-center rounded"
                      hitSlop={8}
                    >
                      <Feather
                        name="edit-2"
                        size={18}
                        color={Colors.light.text}
                      />
                    </Pressable>
                  )}
                </View>

                {/* Detail rows */}
                <View className="gap-4 mb-6">
                  <DetailRow
                    icon="flag"
                    label="Priority"
                    value={capitalize(task.priority)}
                  />
                  <DetailRow
                    icon="map-pin"
                    label="Location"
                    value={formatLocation(task.floor, task.room_number)}
                  />
                  {task.department_name ? (
                    <DetailRow
                      icon="home"
                      label="Department"
                      value={task.department_name}
                    />
                  ) : null}
                </View>

                {/* Description */}
                {task.description ? (
                  <View className="gap-1 mb-6">
                    <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                      Description
                    </Text>
                    <Text className="text-[15px] text-text-default tracking-tight leading-snug">
                      {task.description}
                    </Text>
                  </View>
                ) : null}

                {/* Activity — visible only in full-screen state */}
                {isFullScreen ? (
                  <View className="gap-1 mb-6">
                    <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                      Activity
                    </Text>
                    <Text className="text-[15px] text-text-disabled tracking-tight">
                      No activity yet
                    </Text>
                  </View>
                ) : null}

                {/* Mark as Done / Mark as Pending */}
                {task.status !== "completed" ? (
                  <Pressable
                    onPress={() => {
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                      onComplete?.(task.id);
                      close();
                    }}
                    className="bg-primary rounded items-center justify-center py-2.5 w-full"
                  >
                    <Text className="text-white text-[14px] leading-5">
                      Mark as Done
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onMarkPending?.(task.id);
                      close();
                    }}
                    className="bg-primary rounded items-center justify-center py-2.5 w-full"
                  >
                    <Text className="text-white text-[14px] leading-5">
                      Mark as Pending
                    </Text>
                  </Pressable>
                )}

                {/* Drop Task */}
                {onDropTask ? (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        "Drop Task",
                        "Are you sure you want to drop this task? It will be returned to the unassigned queue.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Drop Task",
                            style: "destructive",
                            onPress: () => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Medium,
                              );
                              onDropTask(task.id);
                              close();
                            },
                          },
                        ],
                      );
                    }}
                    className="border border-primary rounded items-center justify-center py-2.5 w-full mt-2"
                  >
                    <Text className="text-primary text-[14px] leading-5">
                      Drop Task
                    </Text>
                  </Pressable>
                ) : null}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
