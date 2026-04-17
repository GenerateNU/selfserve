import { useEffect, useRef, useState } from "react";
import { View, ScrollView, Modal } from "react-native";
import type {
  Department,
  MakeRequest,
  MakeRequestPriority,
  RoomWithOptionalGuestBooking,
  User,
} from "@shared";
import {
  useGetDepartments,
  useGetRoomsId,
  useGetUsersId,
} from "@shared";
import { getConfig } from "@shared/api/config";
import { TaskFormBody } from "@/components/tasks/TaskFormBody";
import { PriorityPicker } from "@/components/tasks/priority-picker";
import { DepartmentPicker } from "@/components/tasks/department-picker";
import { DeadlinePicker } from "@/components/tasks/deadline-picker";
import { AssigneePicker } from "@/components/tasks/assignee-picker";
import { RoomPicker } from "@/components/tasks/room-picker";

export type GeneratedTask = {
  name: string;
  request_type?: string;
  scheduled_time?: string;
  reoccurring?: string;
  priority?: string;
  room_id?: string;
  department?: string;
  description?: string;
  user_id?: string;
};

type AITaskEditSheetProps = {
  visible: boolean;
  task: GeneratedTask | null;
  onClose: () => void;
  onSave: (task: MakeRequest) => void;
  savePending?: boolean;
  initialDepartment?: Department;
  initialAssignee?: User;
  initialRoom?: RoomWithOptionalGuestBooking;
};

export function AITaskEditSheet({
  visible,
  task,
  onClose,
  onSave,
  savePending = false,
  initialDepartment,
  initialAssignee,
  initialRoom,
}: AITaskEditSheetProps) {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MakeRequestPriority>("medium");
  const [department, setDepartment] = useState<Department | undefined>(
    initialDepartment,
  );
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [assignee, setAssignee] = useState<User | undefined>(initialAssignee);
  const [room, setRoom] = useState<RoomWithOptionalGuestBooking | undefined>(
    initialRoom,
  );

  const { hotelId } = getConfig();

  const { data: departments } = useGetDepartments(hotelId);
  const resolvedDepartment = departments?.find((d) => d.id === task?.department);

  const { data: resolvedUser } = useGetUsersId(task?.user_id ?? "", {
    query: { enabled: !!task?.user_id },
  });

  const { data: resolvedRoom } = useGetRoomsId(task?.room_id ?? "", {
    query: { enabled: !!task?.room_id },
  });

  // Track whether we've fully initialized for the current task so re-renders
  // caused by resolving fetches don't override the user's picker changes.
  const lastInitTaskRef = useRef<GeneratedTask | null>(null);

  useEffect(() => {
    if (!task || !visible) {
      lastInitTaskRef.current = null;
      return;
    }
    if (lastInitTaskRef.current === task) return;

    setTaskName(task.name ?? "");
    setDescription(task.description ?? "");
    setPriority((task.priority as MakeRequestPriority) ?? "medium");
    setDeadline(task.scheduled_time ? new Date(task.scheduled_time) : undefined);
    setDepartment(resolvedDepartment ?? initialDepartment);
    setAssignee(resolvedUser ?? initialAssignee);
    setRoom(resolvedRoom ?? initialRoom);

    // Mark fully initialized only once all expected lookups have resolved,
    // so the effect keeps running until all pickers have their objects.
    const allReady =
      (!task.department || resolvedDepartment != null) &&
      (!task.user_id || resolvedUser != null) &&
      (!task.room_id || resolvedRoom != null);

    if (allReady) {
      lastInitTaskRef.current = task;
    }
  }, [task, visible, resolvedDepartment, resolvedUser, resolvedRoom, initialDepartment, initialAssignee, initialRoom]);

  const handleSave = () => {
    if (!taskName.trim()) return;

    const { hotelId } = getConfig();

    onSave({
      hotel_id: hotelId,
      name: taskName.trim(),
      description: description.trim() || undefined,
      priority,
      department: department?.id ?? task?.department,
      user_id: assignee?.id ?? task?.user_id,
      room_id: room?.id ?? task?.room_id,
      scheduled_time: deadline?.toISOString(),
      status: "pending",
      request_type: task?.request_type ?? "general",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-tl-3xl rounded-tr-3xl bg-white px-6 pt-10 pb-12">
          <View className="absolute top-4 left-0 right-0 items-center">
            <View className="h-1 w-11 rounded-full bg-text-disabled" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TaskFormBody
              title={taskName}
              onTitleChange={setTaskName}
              description={description}
              onDescriptionChange={setDescription}
              fields={
                <>
                  <PriorityPicker
                    value={priority}
                    onChange={(v) => setPriority(v ?? "medium")}
                  />

                  <DeadlinePicker value={deadline} onChange={setDeadline} />

                  <AssigneePicker value={assignee} onChange={setAssignee} />

                  <RoomPicker value={room} onChange={setRoom} />

                  <DepartmentPicker
                    hotelId={getConfig().hotelId}
                    value={department}
                    onChange={setDepartment}
                  />
                </>
              }
              onSave={handleSave}
              onCancel={onClose}
              saveDisabled={!taskName.trim()}
              savePending={savePending}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}