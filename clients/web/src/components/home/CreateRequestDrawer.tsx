import { useEffect, useRef, useState } from "react";
import { Building2, Clock, DoorOpen, Flag, UserRound } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { usePostRequestHook, usePutRequestIdHook } from "@shared/api/generated/endpoints/requests/requests.ts";
import { useGetDepartments } from "@shared/api/departments";
import { REQUESTS_FEED_QUERY_KEY } from "@shared/api/requests";
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
import { cn } from "@/lib/utils";

type ActivityTab = "all" | "comments" | "history";

const ACTIVITY_TABS: Array<{ key: ActivityTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "comments", label: "Comments" },
  { key: "history", label: "History" },
];

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

  const [activeTab, setActiveTab] = useState<ActivityTab>("all");
  const [name, setName] = useState(existingRequest?.name ?? initialData?.name ?? "");
  const [description, setDescription] = useState(existingRequest?.description ?? initialData?.description ?? "");
  const [priority, setPriority] = useState<MakeRequestPriority>(
    existingRequest?.priority ?? initialData?.priority ?? "medium",
  );
  const [deadline, setDeadline] = useState<Date | undefined>(
    existingRequest?.scheduled_time ? new Date(existingRequest.scheduled_time) : undefined,
  );
  const [assignee, setAssignee] = useState<User | undefined>();
  const [room, setRoom] = useState<RoomWithOptionalGuestBooking | undefined>();
  const [department, setDepartment] = useState<Department | undefined>();

  const [isDirty, setIsDirty] = useState(false);

  function markChanged() {
    if (!isDirty) setIsDirty(true);
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

  const { data: allDepartments = [] } = useGetDepartments(backendUser?.hotel_id);

  // Pre-populate assignee from existing request (edit mode)
  const { data: initialAssignee } = useQuery({
    queryKey: ["user", existingRequest?.user_id],
    queryFn: () => getUsersId(existingRequest!.user_id!),
    enabled: !!existingRequest?.user_id,
  });
  const assigneeInitialized = useRef(false);
  useEffect(() => {
    if (initialAssignee && !assigneeInitialized.current) {
      assigneeInitialized.current = true;
      setAssignee(initialAssignee);
    }
  }, [initialAssignee]);

  // Pre-populate department from existing request (edit mode)
  const deptInitialized = useRef(false);
  useEffect(() => {
    if (
      existingRequest?.department &&
      allDepartments.length > 0 &&
      !deptInitialized.current
    ) {
      deptInitialized.current = true;
      const found = allDepartments.find((d) => d.id === existingRequest.department);
      if (found) setDepartment(found);
    }
  }, [existingRequest?.department, allDepartments]);

  const sharedInvalidation = () => {
    queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    if (existingRequest?.id) {
      queryClient.invalidateQueries({ queryKey: ["request", existingRequest.id] });
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
    onSuccess: () => onClose(),
    onSettled: () => sharedInvalidation(),
  });

  const isPending = isCreating || isUpdating;

  function handleSubmit() {
    if (!name.trim() || isPending) return;

    if (existingRequest) {
      updateRequest({
        name: name.trim(),
        priority,
        description: description.trim() || undefined,
        user_id: assignee?.id ?? existingRequest.user_id,
        room_id: room?.id ?? existingRequest.room_id,
        department: department?.id ?? existingRequest.department,
        scheduled_time: deadline?.toISOString() ?? existingRequest.scheduled_time,
      });
    } else {
      if (!backendUser?.hotel_id) return;
      createRequest({
        name: name.trim(),
        hotel_id: backendUser.hotel_id,
        priority,
        status: "pending",
        request_type: "general",
        description: description.trim() || undefined,
        user_id: assignee?.id ?? initialData?.user_id,
        room_id: room?.id ?? initialData?.room_id,
        department: department?.id,
        guest_id: initialData?.guest_id,
        scheduled_time: deadline?.toISOString(),
      });
    }
  }

  const canSubmit = isEditMode ? isDirty && !!name.trim() : !!name.trim();
  const buttonLabel = isPending
    ? isEditMode ? "Saving..." : "Creating..."
    : isEditMode ? "Save Changes" : "Create Request";

  const titleInput = (
    <input
      type="text"
      value={name}
      onChange={(e) => {
        setName(e.target.value);
        if (isEditMode) markChanged();
      }}
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
              selectedUser={assignee}
              onSelect={(user) => { setAssignee(user); markChanged(); }}
            />
          )}
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-8">
          <FieldLabel icon={Clock} label="Deadline" />
          <DeadlinePicker
            selectedDate={deadline}
            onSelect={(date) => { setDeadline(date); markChanged(); }}
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
                onClick={() => { setPriority(p); markChanged(); }}
                className={cn(
                  "rounded px-2 py-0.5 text-xs capitalize transition-colors",
                  priority === p
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
            selectedRoom={room}
            initialRoomId={room ? undefined : (existingRequest?.room_id ?? initialData?.room_id)}
            onSelect={(r) => { setRoom(r); markChanged(); }}
          />
        </div>

        {/* Department */}
        <div className="flex items-center gap-8">
          <FieldLabel icon={Building2} label="Department" />
          {backendUser?.hotel_id && (
            <DepartmentPicker
              hotelId={backendUser.hotel_id}
              selectedDepartment={department}
              onSelect={(d) => { setDepartment(d); markChanged(); }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-subtle">Description</span>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (isEditMode) markChanged();
          }}
          placeholder="Add a description..."
          rows={3}
          className="resize-none bg-transparent text-sm text-text-default placeholder:text-text-subtle outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-text-default">Activity</span>
        <div className="flex items-end justify-between border-b border-stroke-subtle">
          {ACTIVITY_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-3 py-2 text-sm text-text-default transition-colors",
                activeTab === key
                  ? "border-b-2 border-text-default"
                  : "text-text-subtle hover:text-text-default",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant={canSubmit ? "primary" : "secondary"}
        onClick={handleSubmit}
        disabled={!canSubmit || isPending}
        className="mt-auto w-auto self-end"
      >
        {buttonLabel}
      </Button>
    </DrawerShell>
  );
}
