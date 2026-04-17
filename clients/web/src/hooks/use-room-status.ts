import { useMemo } from "react";
import { AccessibilityIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RequestPriority, RoomWithOptionalGuestBooking } from "@shared";

import { NotebookIcon } from "@/icons/notebook";

export type RoomStatusTag = {
  key: string;
  label?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  priority?: "high" | "medium";
  className?: string;
};

export type UseRoomStatusResult = Array<Array<RoomStatusTag>>;

function isHighOrMediumPriority(
  priority: RequestPriority | undefined,
): priority is "high" | "medium" {
  return priority === "high" || priority === "medium";
}

export function useRoomStatus(
  room: RoomWithOptionalGuestBooking,
): UseRoomStatusResult {
  return useMemo(() => {
    const roomWithStatus = room as unknown as {
      prio?: RequestPriority;
      priority?: RequestPriority;
      unassigned?: boolean;
      is_accessible?: boolean;
      isAccessible?: boolean;
    };

    const isAccessible =
      roomWithStatus.is_accessible ?? roomWithStatus.isAccessible ?? false;

    const prio = roomWithStatus.prio ?? roomWithStatus.priority ?? undefined;
    const hasUnassigned = roomWithStatus.unassigned ?? false;

    const tags: Array<RoomStatusTag> = [];
    if (isHighOrMediumPriority(prio)) {
      tags.push({
        key: `priority:${prio}`,
        priority: prio,
      });
    }

    if (isAccessible) {
      tags.push({
        key: "accessible",
        label: "Accessible",
        icon: AccessibilityIcon,
        iconClassName: "size-4",
        className:
          "border-stroke-subtle gap-1 bg-bg-primary text-text-default text-xs",
      });
    }

    if (hasUnassigned) {
      tags.push({
        key: "unassigned-tasks",
        label: "Unassigned Tasks",
        icon: NotebookIcon as unknown as LucideIcon,
        iconClassName: "size-4",
        className:
          "border-stroke-subtle gap-1 bg-bg-primary text-text-default text-xs",
      });
    }

    return tags.length > 0 ? [tags] : [];
  }, [room]);
}
