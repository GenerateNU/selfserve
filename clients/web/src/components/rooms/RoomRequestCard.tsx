import { FlagIcon, MapPinIcon, Maximize2Icon, StoreIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { GuestRequest, RequestPriority } from "@shared";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PriorityConfig = {
  label: string;
  Icon: LucideIcon;
  containerClass: string;
  contentClass: string;
};

const priorityConfig: Record<Exclude<RequestPriority, "low">, PriorityConfig> = {
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
};

export type RoomRequestCardProps = GuestRequest & {
  isAssigned?: boolean;
  onAssignToSelf?: () => void;
  onExpand?: () => void;
  className?: string;
};

export function RoomRequestCard({
  name,
  room_number,
  request_category,
  request_type,
  priority,
  isAssigned,
  onAssignToSelf,
  onExpand,
  className = "",
}: RoomRequestCardProps) {
  const department = request_category ?? request_type;
  const p = priority as RequestPriority | undefined;

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
            {name}
          </span>
          <button
            type="button"
            onClick={onExpand}
            className="shrink-0 text-text-subtle hover:text-text-default"
            aria-label="Expand request"
          >
            <Maximize2Icon className="size-[1.125rem]" strokeWidth={1.5} />
          </button>
        </div>

        {room_number != null && (
          <div className="flex items-center gap-1">
            <MapPinIcon
              className="size-3 shrink-0 text-text-subtle"
              strokeWidth={1.5}
            />
            <span className="text-xs text-text-subtle">
              {`Room ${room_number}`}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {(p === "medium" || p === "high") &&
            (() => {
              const { label, Icon, containerClass, contentClass } =
                priorityConfig[p];
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
          {department && (
            <div className="inline-flex items-center gap-2 rounded border border-stroke-subtle bg-bg-primary px-2 py-1">
              <StoreIcon
                className="size-3 shrink-0 text-text-default"
                strokeWidth={1.5}
              />
              <span className="text-xs text-text-default">{department}</span>
            </div>
          )}
        </div>
      </div>

      {!isAssigned && (
        <Button variant="primary" className="w-full" onClick={onAssignToSelf}>
          Assign to Self
        </Button>
      )}
    </div>
  );
}
