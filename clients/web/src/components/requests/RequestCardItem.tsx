import { Home, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users";
import type { Request } from "@shared";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { RequestCard } from "@/components/requests/RequestCard";
import { RequestCardTimestamp } from "@/components/requests/RequestCardTimestamp";
import { useRoomById } from "@/hooks/use-room-by-id";

function formatRequestTime(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const today = new Date();
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeStr}`;
  }
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    `, ${timeStr}`
  );
}

type RequestCardItemProps = {
  request: Request;
};

export function RequestCardItem({ request }: RequestCardItemProps) {
  const status = request.status as RequestStatus;

  const getUserById = useGetUsersIdHook();
  const { data: assignee } = useQuery({
    queryKey: ["user", request.user_id],
    queryFn: () => getUserById(request.user_id!),
    enabled: !!request.user_id,
  });

  const { data: room } = useRoomById(request.room_id);

  const assigneeName = assignee
    ? `${assignee.first_name ?? ""} ${assignee.last_name ?? ""}`.trim()
    : null;

  const roomLabel = room
    ? `Floor ${room.floor}, Room ${room.room_number}`
    : null;

  const tags = [assigneeName].filter(Boolean) as Array<string>;
  const hasBottomRow = roomLabel || request.department;

  return (
    <RequestCard status={status} className="w-full">
      <RequestCardTimestamp
        status={status}
        time={formatRequestTime(request.scheduled_time ?? request.created_at)}
      />

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium leading-snug text-text-default">
            {request.name ?? "Untitled Request"}
          </span>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded px-2 py-1 text-[11px] tracking-[-0.11px] text-text-secondary bg-stroke-disabled"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {hasBottomRow && (
          <div className="flex items-center gap-3">
            {roomLabel && (
              <span className="flex items-center gap-1 text-xs text-text-subtle">
                <MapPin className="size-3 shrink-0" />
                {roomLabel}
              </span>
            )}
            {request.department && (
              <span className="flex items-center gap-1 text-xs text-text-subtle">
                <Home className="size-3 shrink-0" />
                {request.department}
              </span>
            )}
          </div>
        )}
      </div>
    </RequestCard>
  );
}
