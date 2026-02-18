import type { RoomFilters } from "@/routes/rooms";
import { FloorFilterDropdown } from "@/components/rooms/FloorFilterDropdown";

type RoomsHeaderProps = {
  roomFilters: RoomFilters;
  onRoomFilterChange: <TKey extends keyof RoomFilters>(
    key: TKey,
    value: RoomFilters[TKey],
  ) => void;
};

export function RoomsHeader({ roomFilters, onRoomFilterChange }: RoomsHeaderProps) {
  return (
    <header className="z-30 bg-blue-600 text-white px-[2vw] py-[1vw] flex items-center justify-between">
      <FloorFilterDropdown
        selected={roomFilters.floor}
        onChange={(values) => onRoomFilterChange("floor", values)}
      />
    </header>
  );
}
