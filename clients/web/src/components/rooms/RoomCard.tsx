import type { RoomWithOptionalGuestBooking } from "@shared";
import { cn } from "@/lib/utils";

type RoomCardProps = {
  room: RoomWithOptionalGuestBooking;
  isSelected?: boolean;
  onClick: () => void;
};

export function RoomCard({ room, isSelected = false, onClick }: RoomCardProps) {
  const guestNames = room.guests
    ?.map((g) => [g.first_name, g.last_name].filter(Boolean).join(" "))
    .filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-[0.5vh] flex-1 min-w-0 w-full min-h-[11vh] text-left rounded-lg border px-[1vw] py-[1.5vh] transition-colors",
        isSelected
          ? "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
          : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60",
      )}
    >
      <span className="text-xl font-bold text-zinc-900">
        Room {room.room_number}
      </span>
      {room.suite_type && (
        <span className="text-sm font-light text-zinc-500">{room.suite_type}</span>
      )}
      {guestNames && guestNames.length > 0 && (
        <span className="text-xs font-medium text-zinc-900">
          {guestNames.join(", ")}
        </span>
      )}
      {(room.room_status || room.booking_status) && (
        <div className="flex flex-wrap gap-[0.4vh]">
          {room.room_status && (
            <span className="inline-flex items-center px-[2vw] py-[0.5vh] rounded text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {room.room_status}
            </span>
          )}
          {room.booking_status && (
            <span className="inline-flex items-center px-[2vw] py-[0.5vh] rounded text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
              {room.booking_status}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
