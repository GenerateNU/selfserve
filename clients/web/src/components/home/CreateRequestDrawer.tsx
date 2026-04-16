import { useEffect, useRef, useState } from "react";
import { GripHorizontal } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { usePostRequestHook } from "@shared/api/generated/endpoints/requests/requests.ts";
import { useGetDepartments } from "@shared/api/departments";
import { REQUESTS_FEED_QUERY_KEY } from "@shared/api/requests";
import type {
  Department,
  MakeRequest,
  MakeRequestPriority,
  RoomWithOptionalGuestBooking,
  User,
} from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { AssigneePicker } from "@/components/ui/AssigneePicker";
import { DepartmentPicker } from "@/components/ui/DepartmentPicker";
import { RoomPicker } from "@/components/ui/RoomPicker";
import { cn } from "@/lib/utils";

type ActivityTab = "all" | "comments" | "history";

const ACTIVITY_TABS: Array<{ key: ActivityTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "comments", label: "Comments" },
  { key: "history", label: "History" },
];

const PRIORITIES: Array<MakeRequestPriority> = ["low", "medium", "high"];

type FieldRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function FieldRow({ label, value, valueClassName }: FieldRowProps) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex w-28 shrink-0 items-center gap-1">
        <GripHorizontal className="size-4.5 text-text-subtle" />
        <span className="text-sm text-text-subtle">{label}</span>
      </div>
      <span
        className={cn(
          "rounded-md px-2 py-1 text-sm text-text-subtle",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

type CreateRequestDrawerProps = {
  onClose: () => void;
  initialData?: {
    name?: string;
    description?: string;
    priority?: MakeRequestPriority;
    room_id?: string;
    guest_id?: string;
    user_id?: string;
    department_id?: string;
  };
};

export function CreateRequestDrawer({
  onClose,
  initialData,
}: CreateRequestDrawerProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [priority, setPriority] = useState<MakeRequestPriority>(
    initialData?.priority ?? "medium",
  );
  const [assignee, setAssignee] = useState<User | undefined>();
  const [room, setRoom] = useState<RoomWithOptionalGuestBooking | undefined>();
  const [department, setDepartment] = useState<Department | undefined>();
  const departmentInitialized = useRef(false);

  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const postRequest = usePostRequestHook();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const { data: departments } = useGetDepartments(backendUser?.hotel_id);

  useEffect(() => {
    if (
      !departmentInitialized.current &&
      initialData?.department_id &&
      departments
    ) {
      const match = departments.find((d) => d.id === initialData.department_id);
      if (match) {
        setDepartment(match);
        departmentInitialized.current = true;
      }
    }
  }, [departments, initialData?.department_id]);

  const { mutate: createRequest, isPending } = useMutation({
    mutationFn: (data: MakeRequest) => postRequest(data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    },
    onSuccess: () => {
      onClose();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
    },
  });

  function handleSubmit() {
    if (!name.trim() || !backendUser?.hotel_id || isPending) return;
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
    });
  }

  const titleInput = (
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      placeholder="New Request"
      className="w-full bg-transparent text-3xl font-bold text-text-default placeholder:text-text-subtle outline-none"
      autoFocus
    />
  );

  return (
    <DrawerShell title={titleInput} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-8">
          <div className="flex w-28 shrink-0 items-center gap-1">
            <GripHorizontal className="size-4.5 text-text-subtle" />
            <span className="text-sm text-text-subtle">Priority</span>
          </div>
          <div className="flex items-center gap-1">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
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

        <div className="flex items-center gap-8">
          <div className="flex w-28 shrink-0 items-center gap-1">
            <GripHorizontal className="size-4.5 text-text-subtle" />
            <span className="text-sm text-text-subtle">Assignee</span>
          </div>
          {backendUser?.hotel_id && (
            <AssigneePicker
              hotelId={backendUser.hotel_id}
              selectedUser={assignee}
              onSelect={setAssignee}
            />
          )}
        </div>
        <div className="flex items-center gap-8">
          <div className="flex w-28 shrink-0 items-center gap-1">
            <GripHorizontal className="size-4.5 text-text-subtle" />
            <span className="text-sm text-text-subtle">Room</span>
          </div>
          <RoomPicker
            selectedRoom={room}
            initialRoomId={initialData?.room_id}
            onSelect={setRoom}
          />
        </div>
        <div className="flex items-center gap-8">
          <div className="flex w-28 shrink-0 items-center gap-1">
            <GripHorizontal className="size-4.5 text-text-subtle" />
            <span className="text-sm text-text-subtle">Department</span>
          </div>
          {backendUser?.hotel_id && (
            <DepartmentPicker
              hotelId={backendUser.hotel_id}
              selectedDepartment={department}
              onSelect={setDepartment}
            />
          )}
        </div>

      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-subtle">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!name.trim() || isPending}
        className="mt-auto self-end rounded-lg bg-primary px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {isPending ? "Creating..." : "Create Request"}
      </button>
    </DrawerShell>
  );
}
