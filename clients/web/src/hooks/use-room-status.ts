import { useMemo } from "react";
import { AccessibilityIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RequestPriority, RoomWithOptionalGuestBooking } from "@shared";

import { useUnassignedTasks } from "@/hooks/use-unassigned-tasks";
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

function findHighestPriority(
  priorities: Array<RequestPriority | undefined>,
): "high" | "medium" | undefined {
  if (priorities.some((p) => p === "high")) return "high";
  if (priorities.some((p) => p === "medium")) return "medium";
  return undefined;
}

export function useRoomStatus(
  room: RoomWithOptionalGuestBooking,
): UseRoomStatusResult {
  const { tasks: unassignedTasks } = useUnassignedTasks();

  return useMemo(() => {
    const isAccessible =
      (room as unknown as { is_accessible?: boolean; isAccessible?: boolean })
        .is_accessible ??
      (room as unknown as { isAccessible?: boolean }).isAccessible ??
      false;

    const roomNumber = room.room_number ?? undefined;
    const roomUnassignedTasks =
      roomNumber == null
        ? []
        : unassignedTasks.filter((t) => t.room_number === roomNumber);

    const highestPriority = findHighestPriority(
      roomUnassignedTasks.map((t) => t.priority as RequestPriority | undefined),
    );

    const tags: Array<RoomStatusTag> = [];
    if (isHighOrMediumPriority(highestPriority)) {
      tags.push({
        key: `priority:${highestPriority}`,
        priority: highestPriority,
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

    if (roomUnassignedTasks.length > 0) {
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
  }, [room.room_number, unassignedTasks, room]);
}
