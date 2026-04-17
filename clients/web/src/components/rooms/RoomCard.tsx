import { BookingStatus } from "@shared/api/rooms";
import { UserRoundCheckIcon, UserRoundXIcon } from "lucide-react";
import { TagRow } from "./TagRow";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { CheckBubbleIcon } from "@/icons/check-bubble";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ui/Tag";

function formatGuestNames(
  guests: RoomWithOptionalGuestBooking["guests"] | undefined,
): string {
  const names =
    guests
      ?.map((guest) =>
        `${guest.first_name ?? ""} ${guest.last_name ?? ""}`.trim(),
      )
      .filter(Boolean) ?? [];

  return names.length > 0
    ? "Occupied: " + names.join(", ")
    : "Occupied: " + "—";
}

type RoomCardProps = {
  room: RoomWithOptionalGuestBooking;
  isSelected?: boolean;
  onClick: () => void;
};

export function RoomCard({ room, isSelected = false, onClick }: RoomCardProps) {
  const isOccupied = room.booking_status === BookingStatus.BookingStatusActive;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col bg-bg-primary items-start flex-1 min-w-0 w-full min-h-30 text-left rounded-md border gap-2 px-5 py-4 transition-colors",
        isSelected
          ? "border-stroke-subtle bg-bg-selected shadow-sm"
          : "border-stroke-subtle hover:bg-bg-selected cursor-pointer",
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className="text-xl font-bold text-text-default">
            Room {room.room_number}
          </span>
          {!isOccupied ? (
            <Tag
              icon={CheckBubbleIcon}
              label="Available"
              className="border-0 bg-primary-container text-primary"
              iconClassName="size-4 text-primary"
              labelClassName="text-sm leading-5"
            />
          ) : null}
        </div>
        {isOccupied ? (
          <Tag
            icon={UserRoundCheckIcon}
            label={formatGuestNames(room.guests)}
            className="ml-auto border-0 bg-neutral-20 text-text-secondary"
            iconClassName="size-4 text-text-secondary"
            labelClassName="text-sm leading-[1.25]"
          />
        ) : (
          <Tag
            icon={UserRoundXIcon}
            label={"Vacant"}
            className="ml-auto border-0 bg-neutral-20 text-text-secondary"
            iconClassName="size-4 text-text-secondary"
            labelClassName="text-sm leading-[1.25]"
          />
        )}
      </div>
      <span className="text-sm text-text-subtle">{room.suite_type}</span>
      <TagRow room={room} />
    </button>
  );
}
