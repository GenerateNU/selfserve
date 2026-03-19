import type { Room } from "@/components/rooms/RoomsList";
import { cn } from "@/lib/utils";

type RoomCardProps = {
  room: Room;
  isSelected?: boolean;
  onClick: () => void;
};

export function RoomCard({ room, isSelected = false, onClick }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-[1.5vh] flex-1 min-w-0 w-full min-h-[11vh] text-left rounded-md border px-[0.6vw] py-[0.9vh] transition-colors",
        isSelected
          ? "border-stroke-subtle bg-white shadow-sm"
          : "border-zinc-200 hover:bg-selected",
      )}
    >
      <span className="text-xl font-bold text-zinc-900 ">
        Room {room.room_number}
      </span>
      <span className="text-sm font-light text-zinc-500">{room.room_type}</span>
      <span className="text-xs font-medium text-zinc-900">
        Jane Doe, John Doe
      </span>
      {room.tags && room.tags.length > 0 && (
        <div className="flex flex-wrap gap-[0.4vh]">
          {room.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-[2vw] py-[0.5vh] rounded text-xs font-medium bg-primary text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
