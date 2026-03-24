import type { RoomFilters } from "@/routes/_protected/rooms.index";
import { FloorFilterDropdown } from "@/components/rooms/FloorFilterDropdown";
import { RoomsFilterPopover } from "@/components/rooms/RoomsFilterPopover";

type RoomsHeaderProps = {
  roomFilters: RoomFilters;
  onRoomFilterChange: <TKey extends keyof RoomFilters>(
    key: TKey,
    value: RoomFilters[TKey],
  ) => void;
};

export function RoomsHeader({
  roomFilters,
  onRoomFilterChange,
}: RoomsHeaderProps) {
  return (
    <header className="z-30 bg-bg-container px-16 py-6 flex items-center gap-3">
      <FloorFilterDropdown
        selected={roomFilters.floor}
        onChange={(values) => onRoomFilterChange("floor", values)}
      />
      <RoomsFilterPopover />
    </header>
  );
}
