import { useMemo } from "react";
import { AccessibilityIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RoomWithOptionalGuestBooking } from "@shared";

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

export function useRoomStatus(
  room: RoomWithOptionalGuestBooking,
): UseRoomStatusResult {
  return useMemo(() => {
    const prio = room.priority;
    const isAccessible = room.is_accessible ?? false;
    const hasUnassigned = room.has_unassigned_tasks ?? false;

    const tags: Array<RoomStatusTag> = [];

    if (prio === "high" || prio === "medium") {
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
