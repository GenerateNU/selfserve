import { useState } from "react";
import { Building2, Clock, DoorOpen, Flag, UserRound } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  REQUESTS_FEED_QUERY_KEY,
  useGetUsersIdHook,
  usePostRequestHook,
  usePutRequestIdHook,
} from "@shared";
import type {
  Department,
  MakeRequest,
  MakeRequestPriority,
  Request,
  RoomWithOptionalGuestBooking,
  User,
} from "@shared";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { AssigneePicker } from "@/components/ui/AssigneePicker";
import { DepartmentPicker } from "@/components/ui/DepartmentPicker";
import { RoomPicker } from "@/components/ui/RoomPicker";
import { DeadlinePicker } from "@/components/ui/DeadlinePicker";
import { ActivityFeed } from "@/components/requests/ActivityFeed";
import { cn } from "@/lib/utils";

const PRIORITIES: Array<MakeRequestPriority> = ["low", "medium", "high"];

type FieldLabelProps = {
  icon: LucideIcon;
  label: string;
};

function FieldLabel({ icon: Icon, label }: FieldLabelProps) {
  return (
    <div className="flex w-28 shrink-0 items-center gap-1.5">
      <Icon className="size-4 text-text-subtle" />
      <span className="text-sm text-text-subtle">{label}</span>
    </div>
  );
}

type RequestForm = {
  name: string;
  description: string;
  priority: MakeRequestPriority;
  deadline: Date | undefined;
  user_id: string | undefined;
  room_id: string | undefined;
  department: string | undefined;
};

type CreateRequestDrawerProps = {
  onClose: () => void;
  // Create mode
  initialData?: {
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
    guest_id?: string;
    user_id?: string;
    department_id?: string;
  };
  // Edit mode — pass an existing request to pre-populate and use PUT
  existingRequest?: Request;
};

export function CreateRequestDrawer({
  onClose,
  initialData,
  existingRequest,
}: CreateRequestDrawerProps) {
  const isEditMode = !!existingRequest;

  const [form, setForm] = useState<RequestForm>({
    name: existingRequest?.name ?? initialData?.name ?? "",
    description: existingRequest?.description ?? initialData?.description ?? "",
    priority: existingRequest?.priority ?? initialData?.priority ?? "medium",
    deadline: existingRequest?.scheduled_time
      ? new Date(existingRequest.scheduled_time)
      : undefined,
    user_id: existingRequest?.user_id ?? undefined,
    room_id: existingRequest?.room_id ?? undefined,
    department:
      existingRequest?.department ?? initialData?.department_id ?? undefined,
  });

  const [pickers, setPickers] = useState<{
    assignee: User | undefined;
    room: RoomWithOptionalGuestBooking | undefined;
    department: Department | undefined;
  }>({ assignee: undefined, room: undefined, department: undefined });

  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  function updateForm(updater: (f: RequestForm) => RequestForm) {
    setForm(updater);
    setHasPendingChanges(true);
  }

  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const postRequest = usePostRequestHook();
  const putRequestId = usePutRequestIdHook();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const sharedInvalidation = () => {
    queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    if (existingRequest?.id) {
      queryClient.invalidateQueries({
        queryKey: ["request", existingRequest.id],
      });
    }
  };

  const { mutate: createRequest, isPending: isCreating } = useMutation({
    mutationFn: (data: MakeRequest) => postRequest(data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    },
    onError: () => sharedInvalidation(),
    onSuccess: () => onClose(),
    onSettled: () => sharedInvalidation(),
  });

  const { mutate: updateRequest, isPending: isUpdating } = useMutation({
    mutationFn: (data: Parameters<typeof putRequestId>[1]) =>
      putRequestId(existingRequest!.id!, data),
    onSuccess: () => {
      setHasPendingChanges(false);
    },
    onSettled: () => sharedInvalidation(),
  });

  const isPending = isCreating || isUpdating;

  function handleSubmit() {
    if (!form.name.trim() || isPending) return;

    if (existingRequest) {
      updateRequest({
        name: form.name.trim(),
        priority: form.priority,
        description: form.description.trim() || undefined,
        user_id: form.user_id,
        room_id: form.room_id,
        department: form.department,
        scheduled_time:
          form.deadline?.toISOString() ?? existingRequest.scheduled_time,
      });
    } else {
      if (!backendUser?.hotel_id) return;
      createRequest({
        name: form.name.trim(),
        hotel_id: backendUser.hotel_id,
        priority: form.priority,
        status: "pending",
        request_type: "general",
        description: form.description.trim() || undefined,
        user_id: form.user_id ?? initialData?.user_id,
        room_id: form.room_id ?? initialData?.room_id,
        department: form.department,
        guest_id: initialData?.guest_id,
        scheduled_time: form.deadline?.toISOString(),
      });
    }
  }

  const isDirty = isEditMode && hasPendingChanges;

  const canSubmit = isEditMode
    ? isDirty && !!form.name.trim()
    : !!form.name.trim();
  const buttonLabel = isPending
    ? isEditMode
      ? "Saving..."
      : "Creating..."
    : isEditMode
      ? "Save Changes"
      : "Create Request";

  const titleInput = (
    <input
      type="text"
      value={form.name}
      onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      placeholder="New Request"
      className="w-full bg-transparent text-center text-3xl font-bold text-text-default placeholder:text-text-subtle outline-none"
      autoFocus={!isEditMode}
    />
  );

  return (
    <DrawerShell title={titleInput} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Assignee */}
        <div className="flex items-center gap-8">
          <FieldLabel icon={UserRound} label="Assignee" />
          {backendUser?.hotel_id && (
            <AssigneePicker
              hotelId={backendUser.hotel_id}
              selectedUser={pickers.assignee}
              initialUserId={
                pickers.assignee
                  ? undefined
                  : (existingRequest?.user_id ?? initialData?.user_id)
              }
              onSelect={(user) => {
                setPickers((p) => ({ ...p, assignee: user }));
                updateForm((f) => ({ ...f, user_id: user.id }));
              }}
            />
          )}
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-8">
          <FieldLabel icon={Clock} label="Deadline" />
          <DeadlinePicker
            selectedDate={form.deadline}
            onSelect={(date) => updateForm((f) => ({ ...f, deadline: date }))}
          />
        </div>

        {/* Priority */}
        <div className="flex items-center gap-8">
          <FieldLabel icon={Flag} label="Priority" />
          <div className="flex items-center gap-1">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateForm((f) => ({ ...f, priority: p }))}
                className={cn(
                  "rounded px-2 py-0.5 text-xs capitalize transition-colors",
                  form.priority === p
                    ? "bg-primary text-white"
                    : "text-text-subtle hover:text-text-default",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Room */}
        <div className="flex items-center gap-8">
          <FieldLabel icon={DoorOpen} label="Room" />
          <RoomPicker
            selectedRoom={pickers.room}
            initialRoomId={
              pickers.room
                ? undefined
                : (existingRequest?.room_id ?? initialData?.room_id)
            }
            onSelect={(r) => {
              setPickers((p) => ({ ...p, room: r }));
              updateForm((f) => ({ ...f, room_id: r.id }));
            }}
          />
        </div>

        {/* Department */}
        <div className="flex items-center gap-8">
          <FieldLabel icon={Building2} label="Department" />
          {backendUser?.hotel_id && (
            <DepartmentPicker
              hotelId={backendUser.hotel_id}
              selectedDepartment={pickers.department}
              initialDepartmentId={
                pickers.department
                  ? undefined
                  : (existingRequest?.department ?? initialData?.department_id)
              }
              onSelect={(d) => {
                setPickers((p) => ({ ...p, department: d }));
                updateForm((f) => ({ ...f, department: d?.id }));
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-subtle">Description</span>
        <textarea
          value={form.description}
          onChange={(e) =>
            updateForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Add a description..."
          rows={3}
          className="resize-none bg-transparent text-sm text-text-default placeholder:text-text-subtle outline-none"
        />
      </div>

      {isEditMode && (
        <div className="flex flex-col gap-4">
          <span className="text-base font-bold text-text-default">
            Activity
          </span>
          <ActivityFeed
            requestId={existingRequest.id!}
            hotelId={existingRequest.hotel_id}
          />
        </div>
      )}

      <Button
        variant={canSubmit ? "primary" : "secondary"}
        onClick={handleSubmit}
        disabled={!canSubmit || isPending}
        className="mt-auto w-auto self-end"
      >
        {buttonLabel}
      </Button>

      {isEditMode && (
        <div className="flex flex-col gap-4">
          <span className="text-base font-bold text-text-default">
            Activity
          </span>
          <ActivityFeed requestId={existingRequest.id!} />
        </div>
      )}
    </DrawerShell>
  );
}
