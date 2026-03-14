import type { RoomWithOptionalGuestBooking } from "@shared";
import { RoomCard } from "@/components/rooms/RoomCard";

type RoomsListProps = {
  rooms: Array<RoomWithOptionalGuestBooking>;
  onRoomSelect: (room: RoomWithOptionalGuestBooking) => void;
  selectedRoomNumber?: number | null;
};

export function RoomsList({
  rooms,
  onRoomSelect,
  selectedRoomNumber = null,
}: RoomsListProps) {
  return (
    <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <nav className="flex-1 min-h-0">
        <ul className="flex flex-col gap-[0.55vh] h-full overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden">
          {rooms.map((room) => (
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
