import { useEffect, useRef } from "react";
import { useGetDepartments, useGetRequestActivity, useGetUser } from "@shared";
import type { RequestActivityItem } from "@shared";
import { useRoomById } from "@/hooks/use-room-by-id";
import {
  cn,
  formatFullDate,
  formatTimeAgo,
  getInitials,
  hashNameToColor,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PriorityTag } from "@/components/ui/PriorityTag";

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_PILL: Record<string, string> = {
  pending: "bg-request-pending-secondary text-request-pending",
  "in progress": "bg-request-assigned-secondary text-request-assigned",
  completed: "bg-request-completed-secondary text-request-completed",
  archived: "bg-bg-disabled text-text-subtle",
};

function StatusPill({ value }: { value: string }) {
  return (
    <Pill className={STATUS_PILL[value] ?? "bg-bg-container text-text-default"}>
      {capitalize(value)}
    </Pill>
  );
}

function buildDescription(
  item: RequestActivityItem,
  actorName: string,
  targetName: string | undefined,
): React.ReactNode {
  const actor = <strong>{actorName}</strong>;

  switch (item.type) {
    case "created":
      return <>{actor} created this request</>;
    case "status_changed":
      return <>{actor} changed status</>;
    case "priority_changed":
      return <>{actor} changed priority</>;
    case "assigned":
      return (
        <>
          {actor} assigned to <strong>{targetName ?? "someone"}</strong>
        </>
      );
    case "unassigned":
      return <>{actor} removed assignee</>;
    case "name_changed":
    case "title_changed":
      return <>{actor} renamed request</>;
    case "description_changed":
      return <>{actor} updated the description</>;
    case "department_changed":
      return <>{actor} changed department</>;
    case "room_changed":
      return <>{actor} changed room</>;
    default:
      return <>{actor} updated request</>;
  }
}

function EmptyPill() {
  return <Pill className="bg-bg-container text-text-subtle italic">Empty</Pill>;
}

function buildDetail(
  item: RequestActivityItem,
  deptById: Record<string, string>,
): React.ReactNode | null {
  if (item.old_value && item.new_value) {
    if (item.type === "status_changed") {
      return (
        <>
          <StatusPill value={item.old_value} />
          <span className="text-text-subtle">to</span>
          <StatusPill value={item.new_value} />
        </>
      );
    }
    if (item.type === "priority_changed") {
      return (
        <>
          <PriorityTag priority={item.old_value} />
          <span className="text-text-subtle">to</span>
          <PriorityTag priority={item.new_value} />
        </>
      );
    }
    if (item.type === "name_changed" || item.type === "title_changed") {
      return (
        <Pill className="bg-bg-container text-text-default">
          {item.new_value}
        </Pill>
      );
    }
  }
  if (item.type === "department_changed" && item.new_value) {
    const oldName = item.old_value
      ? (deptById[item.old_value] ?? item.old_value)
      : null;
    const newName = deptById[item.new_value] ?? item.new_value;
    return (
      <>
        {oldName ? (
          <Pill className="bg-bg-container text-text-default">{oldName}</Pill>
        ) : (
          <EmptyPill />
        )}
        <span className="text-text-subtle">to</span>
        <Pill className="bg-bg-container text-text-default">{newName}</Pill>
      </>
    );
  }
  return null;
}

function RoomChangedDetail({ oldId, newId }: { oldId: string; newId: string }) {
  const { data: oldRoom } = useRoomById(oldId || undefined);
  const { data: newRoom } = useRoomById(newId || undefined);
  const newLabel =
    newRoom?.room_number != null ? String(newRoom.room_number) : newId;
  return (
    <>
      {oldId ? (
        <Pill className="bg-bg-container text-text-default">
          {oldRoom?.room_number != null ? String(oldRoom.room_number) : oldId}
        </Pill>
      ) : (
        <EmptyPill />
      )}
      <span className="text-text-subtle">to</span>
      <Pill className="bg-bg-container text-text-default">Room {newLabel}</Pill>
    </>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type ActivityRowProps = {
  item: RequestActivityItem;
  isLast: boolean;
  deptById: Record<string, string>;
};

function ActivityRow({ item, isLast, deptById }: ActivityRowProps) {
  const { data: actor } = useGetUser(item.changed_by ?? undefined);
  const { data: target } = useGetUser(
    item.type === "assigned" && item.new_value ? item.new_value : undefined,
  );

  const actorName = actor
    ? [actor.first_name, actor.last_name].filter(Boolean).join(" ")
    : "Member";
  const targetName = target?.first_name;
  const detail =
    item.type === "room_changed" &&
    item.old_value != null &&
    item.new_value != null ? (
      <RoomChangedDetail oldId={item.old_value} newId={item.new_value} />
    ) : (
      buildDetail(item, deptById)
    );

  return (
    <div className={cn("flex gap-4", !isLast && "mb-2")}>
      {/* Avatar + timeline line */}
      <div className="flex flex-col items-center">
        {actor?.profile_picture ? (
          <img
            src={actor.profile_picture}
            alt={actorName}
            className="size-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              hashNameToColor(actorName),
            )}
          >
            {getInitials(actorName)}
          </div>
        )}
        {!isLast && <div className="mt-2 w-px flex-1 bg-stroke-disabled" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex min-w-0 flex-1 items-start justify-between gap-4",
          !isLast && "pb-7",
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex min-h-8 items-center">
            <p className="text-sm text-text-default">
              {buildDescription(item, actorName, targetName)}
            </p>
          </div>
          {detail && (
            <div className="flex items-center gap-1.5 text-xs">{detail}</div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 text-xs text-text-subtle cursor-default pt-0.5">
                {formatTimeAgo(item.timestamp)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{formatFullDate(item.timestamp)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

type ActivityFeedProps = {
  requestId: string;
  hotelId: string | undefined;
};

export function ActivityFeed({ requestId, hotelId }: ActivityFeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useGetRequestActivity(requestId);
  const { data: departments } = useGetDepartments(hotelId);
  const deptById: Record<string, string> = {};
  for (const d of departments ?? []) {
    deptById[d.id] = d.name;
  }

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isPending) {
    return <p className="text-sm text-text-subtle py-2">Loading...</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-text-subtle py-2">No activity yet.</p>;
  }

  return (
    <div className="pl-3">
      {items.map((item, i) => (
        <ActivityRow
          key={`${item.type}-${item.timestamp}-${i}`}
          item={item}
          isLast={i === items.length - 1 && !hasNextPage}
          deptById={deptById}
        />
      ))}
      {isFetchingNextPage && (
        <p className="text-xs text-text-subtle pl-10">Loading more...</p>
      )}
      <div ref={sentinelRef} className="h-1 shrink-0" />
    </div>
  );
}
