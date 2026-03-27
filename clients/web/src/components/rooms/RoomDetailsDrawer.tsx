import type { RoomWithOptionalGuestBooking } from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";

type RoomDetailsDrawerProps = {
  room: RoomWithOptionalGuestBooking | null;
  onClose: () => void;
};

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
    <DrawerShell title={`Room ${room.room_number}`} onClose={onClose}>
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
                  <span className="text-xs text-zinc-500">{guest.timezone}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-zinc-900 dark:text-zinc-100">—</span>
        )}
      </div>
    </DrawerShell>
  );
}
