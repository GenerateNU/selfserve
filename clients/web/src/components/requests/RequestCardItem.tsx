import { Home, MapPin } from "lucide-react";
import type { Request } from "@shared";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { RequestCard } from "@/components/requests/RequestCard";
import { RequestCardTimestamp } from "@/components/requests/RequestCardTimestamp";

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

  return (
    <RequestCard status={status} className="w-full">
      <RequestCardTimestamp
        status={status}
        time={formatRequestTime(request.created_at)}
      />
      <span className="text-base font-medium text-text-default pt-3">
        {request.name ?? "Untitled Request"}
      </span>
      <div className="flex items-center gap-3 text-xs text-text-secondary pt-2">
        {request.room_id && (
          <span className="flex items-center gap-1">
            <MapPin className="size-4 color-text-secondary" />
            {request.room_id}
          </span>
        )}
        {request.department && (
          <span className="flex items-center gap-1">
            <Home className="size-4 color-text-secondary" />
            {request.department}
          </span>
        )}
      </div>
    </RequestCard>
  );
}
