import { RequestCard } from "@/components/requests/RequestCard";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { Clock, MapPin, Home } from "lucide-react";

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
      <div className="flex items-center gap-2 self-start rounded-full bg-request-pending-secondary px-3 py-1 text-sm font-medium text-request-pending">
        <Clock className="size-4" />
        {time}
      </div>
      <span className="text-xl font-bold text-zinc-900">{title}</span>
      <div className="flex gap-2">
        {assignees.map((name) => (
          <span
            key={name}
            className="rounded-md bg-zinc-100 px-3 py-1 text-sm text-zinc-600"
          >
            {name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-500">
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
