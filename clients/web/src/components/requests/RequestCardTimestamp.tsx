import { cva } from "class-variance-authority";
import { Clock } from "lucide-react";
import type { RequestPriority } from "@shared";
import { cn } from "@/lib/utils";

type RequestCardTimestampProps = {
  priority: RequestPriority;
  time: string;
  className?: string;
};

const timestampVariants = cva(
  "flex items-center gap-2 self-start rounded-sm px-2 py-1 text-xs font-medium",
  {
    variants: {
      priority: {
        high: "bg-priority-high-secondary text-priority-high",
        medium: "bg-priority-medium-secondary text-priority-medium",
        low: "bg-priority-low-secondary text-priority-low",
      },
    },
    defaultVariants: {
      priority: "low",
    },
  },
);

export function RequestCardTimestamp({
  priority,
  time,
  className,
}: RequestCardTimestampProps) {
  return (
    <div className={cn(timestampVariants({ priority }), className)}>
      <Clock className="size-3 stroke-[2.5px]" />
      {time}
    </div>
  );
}
