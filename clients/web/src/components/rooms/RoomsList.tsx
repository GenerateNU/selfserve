import { useMemo } from "react";
import type { RoomWithOptionalGuestBooking } from "@shared";
import type { RoomSortOption } from "@/components/rooms/OrderByDropdown";
import { RoomCard } from "@/components/rooms/RoomCard";

type RoomsListProps = {
  rooms: Array<RoomWithOptionalGuestBooking>;
  onRoomSelect: (room: RoomWithOptionalGuestBooking) => void;
  sortOption: RoomSortOption;
  selectedRoomNumber?: number | null;
};

const PRIORITY_RANK: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function sortRooms(
  rooms: Array<RoomWithOptionalGuestBooking>,
  sortOption: RoomSortOption,
): Array<RoomWithOptionalGuestBooking> {
  return [...rooms].sort((a, b) => {
    if (sortOption === "urgency") {
      const ar = PRIORITY_RANK[a.priority ?? ""] ?? 0;
      const br = PRIORITY_RANK[b.priority ?? ""] ?? 0;
      if (br !== ar) return br - ar;
      return (a.room_number ?? 0) - (b.room_number ?? 0);
    }
    const an = a.room_number ?? 0;
    const bn = b.room_number ?? 0;
    return sortOption === "ascending" ? an - bn : bn - an;
  });
}

export function RoomsList({
  rooms,
  onRoomSelect,
  sortOption,
  selectedRoomNumber = null,
}: RoomsListProps) {
  const sortedRooms = useMemo(
    () => sortRooms(rooms, sortOption),
    [rooms, sortOption],
  );

  return (
    <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <nav className="flex-1 min-h-0">
        <ul className="flex flex-col gap-4 h-full overflow-y-auto min-h-0 pb-24 [&::-webkit-scrollbar]:hidden">
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
