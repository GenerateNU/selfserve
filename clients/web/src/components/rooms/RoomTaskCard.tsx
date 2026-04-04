import type { LucideIcon } from "lucide-react";
import {
  FlagIcon,
  MapPinIcon,
  Maximize2Icon,
  StoreIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Priority = "high" | "medium" | "low";

type PriorityConfig = {
  label: string;
  Icon: LucideIcon;
  containerClass: string;
  contentClass: string;
};

const priorityConfig: Record<Priority, PriorityConfig> = {
  high: {
    label: "High Priority",
    Icon: FlagIcon,
    containerClass: "bg-bg-high-priority",
    contentClass: "text-high-priority",
  },
  medium: {
    label: "Medium Priority",
    Icon: FlagIcon,
    containerClass: "bg-bg-orange",
    contentClass: "text-text-orange",
  },
  low: {
    label: "Low Priority",
    Icon: TriangleAlertIcon,
    containerClass: "bg-warning-accent",
    contentClass: "text-warning",
  },
};

export type RoomTaskCardData = {
  title: string;
  floor: number;
  roomNumber: number;
  department: string;
  priority?: Priority;
};

export type RoomTaskCardProps = RoomTaskCardData & {
  onAssign: () => void;
  onExpand?: () => void;
  className?: string;
};

export function RoomTaskCard({
  title,
  floor,
  roomNumber,
  department,
  priority,
  onAssign,
  onExpand,
  className = "",
}: RoomTaskCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded border border-stroke-disabled bg-bg-primary px-3 py-4",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-medium leading-snug tracking-tight text-text-default">
            {title}
          </span>
          <button
            type="button"
            onClick={onExpand}
            className="shrink-0 text-text-subtle hover:text-text-default"
            aria-label="Expand task"
          >
            <Maximize2Icon className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <MapPinIcon
            className="size-3 shrink-0 text-text-subtle"
            strokeWidth={1.5}
          />
          <span className="text-xs text-text-subtle">
            Floor {floor}, Room {roomNumber}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {priority &&
            (() => {
              const { label, Icon, containerClass, contentClass } =
                priorityConfig[priority];
              return (
                <div
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-2 py-1",
                    containerClass,
                  )}
                >
                  <Icon
                    className={cn("size-4", contentClass)}
                    strokeWidth={2}
                  />
                  <span className={cn("text-xs", contentClass)}>{label}</span>
                </div>
              );
            })()}
          <div className="inline-flex items-center gap-2 rounded border border-stroke-subtle bg-bg-primary px-2 py-1">
            <StoreIcon
              className="size-3 shrink-0 text-text-default"
              strokeWidth={1.5}
            />
            <span className="text-xs text-text-default">{department}</span>
          </div>
        </div>
      </div>

      <Button variant="primary" className="w-full" onClick={onAssign}>
        Assign to Self
      </Button>
    </div>
  );
}
