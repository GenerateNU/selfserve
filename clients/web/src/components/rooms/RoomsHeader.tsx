import { Search } from "lucide-react";
import type { RoomFilters } from "@/routes/_protected/rooms";
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
}: R\oomsHeaderProps) {
  return (
    <header className="z-30 bg-bg-container px-[2vw] py-[1vw] flex items-center justify-between">
      <FloorFilterDropdown
        selected={roomFilters.floor}
        onChange={(values) => onRoomFilterChange("floor", values)}
      />
    </header>
  );
}
