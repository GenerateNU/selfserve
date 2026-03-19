import { RequestCard } from "@/components/requests/RequestCard";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { RequestCardTimestamp } from "@/components/requests/RequestCardTimestamp";
import { MapPin, Home } from "lucide-react";

type RequestCardItemProps = {
  status: RequestStatus;
  time: string;
  title: string;
  assignees: string[];
  location: string;
  department: string;
};

export function RequestCardItem({
  status,
  time,
  title,
  assignees,
  location,
  department,
}: RequestCardItemProps) {
  return (
    <RequestCard status={status} className="w-81.25">
      <RequestCardTimestamp status={status} time={time} />
      <span className="text-base font-medium text-text-default pt-3">{title}</span>
      <div className="flex gap-1 pt-1">
        {assignees.map((name) => (
          <span
            key={name}
            className="rounded-md bg-stroke-disabled px-2 py-1 text-[11px] text-text-secondary"
          >
            {name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-text-secondary pt-2">
        <span className="flex items-center gap-1">
          <MapPin className="size-4 color-text-secondary" />
          {location}
        </span>
        <span className="flex items-center gap-1">
          <Home className="size-4 color-text-secondary" />
          {department}
        </span>
      </div>
    </RequestCard>
  );
}
