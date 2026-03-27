import { useMemo } from "react";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { RoomCard } from "@/components/rooms/RoomCard";

type RoomsListProps = {
  rooms: Array<RoomWithOptionalGuestBooking>;
  onRoomSelect: (room: RoomWithOptionalGuestBooking) => void;
  ascending: boolean;
  selectedRoomNumber?: number | null;
};

function sortRoomsByRoomNumber(
  rooms: Array<RoomWithOptionalGuestBooking>,
  ascending: boolean,
): Array<RoomWithOptionalGuestBooking> {
  return [...rooms].sort((a, b) => {
    const an = a.room_number ?? 0;
    const bn = b.room_number ?? 0;
    return ascending ? an - bn : bn - an;
  });
}

export function RoomsList({
  rooms,
  onRoomSelect,
  ascending,
  selectedRoomNumber = null,
}: RoomsListProps) {
  const sortedRooms = useMemo(
    () => sortRoomsByRoomNumber(rooms, ascending),
    [rooms, ascending],
  );

  return (
    <section className="flex-1 min-h-0 flex flex-col overflow-hidden py-4">
      <nav className="flex-1 min-h-0">
        <ul className="flex flex-col gap-4 h-full overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden">
          {sortedRooms.map((room) => (
            <li key={room.room_number} className="min-w-0">
              <RoomCard
                room={room}
                isSelected={selectedRoomNumber === room.room_number}
                onClick={() => onRoomSelect(room)}
              />
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
