import { useState } from "react";
import { GripHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGetRequestActivity, useGetUsersIdHook } from "@shared";
import type { Request } from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { useRoomById } from "@/hooks/use-room-by-id";
import { ActivityFeed } from "@/components/requests/ActivityFeed";
import { cn } from "@/lib/utils";

type ActivityTab = "all" | "comments" | "history";

const ACTIVITY_TABS: Array<{ key: ActivityTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "comments", label: "Comments" },
  { key: "history", label: "History" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-info-default",
  medium: "text-warning-default",
  high: "text-danger-default",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-warning-default",
  assigned: "text-info-default",
  completed: "text-success-default",
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type FieldRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function FieldRow({ label, value, valueClassName }: FieldRowProps) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex w-36 shrink-0 items-center gap-1">
        <GripHorizontal className="size-4.5 text-text-subtle" />
        <span className="text-sm text-text-subtle whitespace-nowrap">
          {label}
        </span>
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

type ViewRequestDrawerProps = {
  request: Request | null;
  onClose: () => void;
};

export function ViewRequestDrawer({
  request,
  onClose,
}: ViewRequestDrawerProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");

  const getUserById = useGetUsersIdHook();
  const { data: assignee } = useQuery({
    queryKey: ["user", request?.user_id],
    queryFn: () => getUserById(request!.user_id!),
    enabled: !!request?.user_id,
  });

  const { data: room } = useRoomById(request?.room_id);
  const { data: activityItems = [] } = useGetRequestActivity(
    request?.id ?? null,
  );

  if (!request) {
    return (
      <DrawerShell title="" onClose={onClose}>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 animate-pulse rounded-md bg-bg-disabled"
            />
          ))}
        </div>
      </DrawerShell>
    );
  }

  const assigneeName = assignee
    ? `${assignee.first_name ?? ""} ${assignee.last_name ?? ""}`.trim()
    : null;

  const roomLabel = room
    ? `Floor ${room.floor}, Room ${room.room_number}`
    : null;

  return (
    <DrawerShell title={request.name ?? "Untitled Request"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {request.status && (
          <FieldRow
            label="Status"
            value={request.status}
            valueClassName={cn("capitalize", STATUS_COLORS[request.status])}
          />
        )}
        {request.priority && (
          <FieldRow
            label="Priority"
            value={request.priority}
            valueClassName={cn("capitalize", PRIORITY_COLORS[request.priority])}
          />
        )}
        {assigneeName && <FieldRow label="Assignee" value={assigneeName} />}
        {roomLabel && <FieldRow label="Room" value={roomLabel} />}
        {request.department && (
          <FieldRow label="Department" value={request.department} />
        )}
        {request.request_type && (
          <FieldRow label="Type" value={request.request_type} />
        )}
        {request.request_category && (
          <FieldRow label="Category" value={request.request_category} />
        )}
        {request.scheduled_time && (
          <FieldRow
            label="Scheduled"
            value={formatDate(request.scheduled_time)}
          />
        )}
        {request.estimated_completion_time && (
          <FieldRow
            label="Est. Completion"
            value={`${request.estimated_completion_time} min`}
          />
        )}
        {request.created_at && (
          <FieldRow label="Created" value={formatDate(request.created_at)} />
        )}
        {request.completed_at && (
          <FieldRow
            label="Completed"
            value={formatDate(request.completed_at)}
          />
        )}
      </div>

      {request.description && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-subtle">Description</span>
          <p className="text-sm text-text-default">{request.description}</p>
        </div>
      )}

      {request.notes && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-subtle">Notes</span>
          <p className="text-sm text-text-default">{request.notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <span className="text-sm font-bold text-text-default">Activity</span>
        <div className="flex items-end justify-between border-b border-stroke-subtle">
          {ACTIVITY_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-3 py-2 text-sm transition-colors",
                activeTab === key
                  ? "border-b-2 border-text-default text-text-default"
                  : "text-text-subtle hover:text-text-default",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {activeTab === "comments" ? (
          <p className="text-sm text-text-subtle">No comments yet.</p>
        ) : (
          <ActivityFeed items={activityItems} />
        )}
      </div>
    </DrawerShell>
  );
}
