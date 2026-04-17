import { Flag } from "lucide-react";
import type { RequestPriority } from "@shared";
import { cn } from "@/lib/utils";

type PriorityConfig = {
  containerClass: string;
  textClass: string;
  iconClass: string;
  label: string;
};

const PRIORITY_CONFIG: Record<RequestPriority, PriorityConfig> = {
  high: {
    containerClass: "bg-priority-high-secondary",
    textClass: "text-priority-high",
    iconClass: "stroke-priority-high",
    label: "High Priority",
  },
  medium: {
    containerClass: "bg-priority-medium-secondary",
    textClass: "text-priority-medium",
    iconClass: "stroke-priority-medium",
    label: "Medium Priority",
  },
  low: {
    containerClass: "bg-priority-low-secondary",
    textClass: "text-priority-low",
    iconClass: "stroke-priority-low",
    label: "Low Priority",
  },
};

type PriorityTagProps = {
  priority: string;
  dimmed?: boolean;
  className?: string;
};

export function PriorityTag({
  priority,
  dimmed = false,
  className,
}: PriorityTagProps) {
  const config =
    (PRIORITY_CONFIG as Record<string, PriorityConfig>)[
      priority.toLowerCase()
    ] ?? PRIORITY_CONFIG.low;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-1",
        config.containerClass,
        className,
      )}
    >
      <Flag
        className={cn(
          "size-3",
          dimmed ? "stroke-bg-disabled" : config.iconClass,
        )}
      />
      <span
        className={cn(
          "text-xs",
          dimmed ? "text-text-subtle" : config.textClass,
        )}
      >
        {config.label}
      </span>
    </div>
  );
}
