import type { RoomWithOptionalGuestBooking } from "@shared";
import { Tag } from "@/components/ui/Tag";
import { useRoomStatus } from "@/hooks/use-room-status";

export function TagRow({ room }: { room: RoomWithOptionalGuestBooking }) {
  const rows = useRoomStatus(room);

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap gap-2 pt-1">
      {rows[0].map((t) => (
        <Tag
          key={t.key}
          label={t.label}
          icon={t.icon}
          iconClassName={t.iconClassName}
          priority={t.priority}
          className={t.className}
        />
      ))}
    </div>
  );
}
