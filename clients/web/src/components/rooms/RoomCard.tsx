import {
  Ban,
  BrushCleaning,
  CircleAlert,
  CircleUserRound,
  UserRoundCheck,
} from "lucide-react";
import { Tag } from "../ui/Tag";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { cn } from "@/lib/utils";

type RoomCardProps = {
  room: RoomWithOptionalGuestBooking;
  isSelected?: boolean;
  onClick: () => void;
};

function getGuestDisplay(room: RoomWithOptionalGuestBooking) {
  const hasGuests = (room.guests?.length ?? 0) > 0;
  const guestLabel = room.guests
    ?.map((guest) => `${guest.first_name} ${guest.last_name}`)
    .join(", ");

  return { hasGuests, guestLabel };
}

export function RoomCard({ room, isSelected = false, onClick }: RoomCardProps) {
  const { hasGuests, guestLabel } = getGuestDisplay(room);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start flex-1 min-w-0 w-full min-h-36.25 text-left rounded-md border gap-2 px-5 py-4 transition-colors",
        isSelected
          ? "border-stroke-subtle bg-bg-selected shadow-sm"
          : "border-stroke-subtle hover:bg-bg-selected cursor-pointer",
      )}
    >
      <span className="text-xl font-bold text-text-default ">
        Room {room.room_number}
      </span>
      <span className="text-sm text-text-subtle">{room.suite_type}</span>
      {hasGuests && (
        <div className="flex items-center gap-1 text-sm text-text-subtle pb-3">
          <CircleUserRound className="h-4.5 w-4.5 shrink-0" />
          <span className="truncate">{guestLabel}</span>
        </div>
      )}
      {/* Hardcoded tag for now */}
      <div className="flex flex-row gap-3 pt-1">
        <Tag icon={CircleAlert} label="Urgent Task" variant="danger" />
        <Tag icon={UserRoundCheck} label="Occupied" variant="default" />
        <Tag icon={BrushCleaning} label="Needs Cleaning" variant="default" />
      </div>
    </button>
  );
}
