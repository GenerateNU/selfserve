import { cva } from "class-variance-authority";
import { Clock } from "lucide-react";
import type { RequestStatus } from "@/components/requests/RequestCard";
import { cn } from "@/lib/utils";

type RequestCardTimestampProps = {
  status: RequestStatus;
  time: string;
  className?: string;
};

const timestampVariants = cva(
  "flex items-center gap-2 self-start rounded-sm px-2 py-1 text-xs font-medium",
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
  },
);

export function RequestCardTimestamp({
  status,
  time,
  className,
}: RequestCardTimestampProps) {
  return (
    <div className={cn(timestampVariants({ status }), className)}>
      <Clock className="size-3 stroke-[2.5px]" />
      {time}
    </div>
  );
}
