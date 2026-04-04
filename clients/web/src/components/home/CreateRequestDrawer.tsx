import { useState } from "react";
import { ChevronDown, GripHorizontal } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { usePostRequestHook } from "@shared/api/generated/endpoints/requests/requests.ts";
import type { MakeRequest } from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { cn } from "@/lib/utils";

type ActivityTab = "all" | "comments" | "history";

const ACTIVITY_TABS: Array<{ key: ActivityTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "comments", label: "Comments" },
  { key: "history", label: "History" },
];

const PRIORITIES = ["low", "medium", "normal", "high", "urgent"] as const;
type Priority = (typeof PRIORITIES)[number];

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
      <span className={cn("text-sm text-text-default", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

type CreateRequestDrawerProps = {
  onClose: () => void;
};

export function CreateRequestDrawer({ onClose }: CreateRequestDrawerProps) {
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");

  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const postRequest = usePostRequestHook();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const { mutate: createRequest, isPending } = useMutation({
    mutationFn: (data: MakeRequest) => postRequest(data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["/request/cursor"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["/request/cursor"] });
    },
    onSuccess: () => {
      onClose();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/request/cursor"] });
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

        <FieldRow
          label="Assignee"
          value="Assign Someone"
          valueClassName="text-primary"
        />
        <FieldRow label="Deadline" value="Empty" />
        <FieldRow label="Department" value="Empty" />
        <FieldRow label="Location" value="Empty" />

        {showMore && (
          <>
            <FieldRow label="Room" value="Empty" />
            <FieldRow label="Tags" value="Empty" />
          </>
        )}

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex items-center gap-2 text-xs text-text-subtle transition-colors hover:text-text-default"
        >
          Show More
          <ChevronDown
            className={cn(
              "size-3 transition-transform",
              showMore && "rotate-180",
            )}
          />
        </button>
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
