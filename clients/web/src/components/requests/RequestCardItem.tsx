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
    <RequestCard status={status}>
      <RequestCardTimestamp status={status} time={time} />
      <span className="text-xl font-bold text-text-default">{title}</span>
      <div className="flex gap-2">
        {assignees.map((name) => (
          <span
            key={name}
            className="rounded-md bg-stroke-disabled px-3 py-1 text-sm text-text-secondary"
          >
            {name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm text-text-secondary">
        <span className="flex items-center gap-1">
          <MapPin className="size-4" />
          {location}
        </span>
        <span className="flex items-center gap-1">
          <Home className="size-4" />
          {department}
        </span>
      </div>
    </RequestCard>
  );
}
