import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { Clock } from "lucide-react";

type RequestCardTimestampProps = {
  status: RequestStatus;
  time: string;
  className?: string;
};

const timestampVariants = cva(
  "flex items-center gap-2 self-start rounded-full px-3 py-1 text-sm font-medium",
  {
    variants: {
      status: {
        pending: "bg-request-pending-secondary text-request-pending",
        completed: "bg-request-completed-secondary text-request-completed",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

export function RequestCardTimestamp({ status, time, className }: RequestCardTimestampProps) {
  return (
    <div className={cn(timestampVariants({ status }), className)}>
      <Clock className="size-4" />
      {time}
    </div>
  );
}
