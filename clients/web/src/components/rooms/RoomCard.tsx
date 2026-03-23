import { cn } from "@/lib/utils";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { Ban, Circle, CircleAlert, Info } from "lucide-react";
import { Tag } from "../ui/Tag";

type RoomCardProps = {
  room: RoomWithOptionalGuestBooking;
  isSelected?: boolean;
  onClick: () => void;
};

function getGuestDisplay(room: RoomWithOptionalGuestBooking) {
  const hasGuests = (room.guests?.length ?? 0) > 0;
  const guestLabel =
    room.guests
      ?.map((guest) => `${guest.first_name} ${guest.last_name}`)
      .join(", ") || "Unoccupied";

  return { hasGuests, guestLabel };
}

export function RoomCard({ room, isSelected = false, onClick }: RoomCardProps) {
  const { hasGuests, guestLabel } = getGuestDisplay(room);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start flex-1 min-w-0 w-full min-h-36.25 text-left rounded-md border gap-1 px-5 py-4 transition-colors",
        isSelected
          ? "border-stroke-subtle bg-bg-selected shadow-sm"
          : "border-stroke-subtle hover:bg-bg-selected cursor-pointer",
      )}
    >
      <span className="text-xl font-bold text-text-default ">
        Room {room.room_number}
      </span>
      <span className="text-sm font-light text-text-subtle">
        {room.suite_type}
      </span>
      <div className="flex items-center gap-1 text-sm text-text-default pb-3">
        {hasGuests ? (
          <Circle className="h-4 w-4 shrink-0 fill-stroke-subtle stroke-stroke-subtle" />
        ) : (
          <Ban className="h-4 w-4 shrink-0 text-text-subtle" />
        )}
        <span className="truncate">{guestLabel}</span>
      </div>
      {/* Hardcoded tag for now */}
      <div className="flex flex-row gap-3">
        <Tag icon={CircleAlert} label="Urgent Task" variant="danger" />
        <Tag icon={Info} label="Occupied" variant="default" />
        <Tag icon={Info} label="Needs Cleaning" variant="default" />
      </div>
    </button>
  );
}
