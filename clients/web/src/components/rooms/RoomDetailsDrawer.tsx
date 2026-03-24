import { X } from "lucide-react";
import type { RoomWithOptionalGuestBooking } from "@shared";

type RoomDetailsDrawerProps = {
  room: RoomWithOptionalGuestBooking | null;
  onClose: () => void;
};

// Generic ass field component for now this is getting nuked when the drawer is finalized
function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100">
        {value ?? "—"}
      </span>
    </div>
  );
}

export function RoomDetailsDrawer({ room, onClose }: RoomDetailsDrawerProps) {
  if (!room) return null;

  return (
    <aside className="flex h-full w-full flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <h2 className="text-3xl font-bold">Room {room.room_number}</h2>
        <button type="button" onClick={onClose} className="p-[0.6vw]">
          <X />
        </button>
      </header>

      <div className="flex flex-col gap-4 px-6 py-2">
        <Field label="Floor" value={room.floor} />
        <Field label="Suite Type" value={room.suite_type} />
        <Field label="Room Status" value={room.room_status} />
        <Field label="Booking Status" value={room.booking_status} />

        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wide">
            Guests
          </span>
          {room.guests && room.guests.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {room.guests.map((guest) => (
                <li
                  key={guest.id}
                  className="flex flex-col gap-1 text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <span className="font-medium">
                    {[guest.first_name, guest.last_name]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </span>
                  {guest.timezone && (
                    <span className="text-xs text-zinc-500">
                      {guest.timezone}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-zinc-900 dark:text-zinc-100">—</span>
          )}
        </div>
      </div>
    </aside>
  );
}
