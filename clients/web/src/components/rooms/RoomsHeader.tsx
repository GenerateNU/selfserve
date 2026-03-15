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
}: RoomsHeaderProps) {
  return (
    <header className="z-30 bg-gray-100 text-gray-900 px-6 py-4 flex items-center gap-3">
      <RoomsFilterPopover />

      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 flex-1 max-w-sm">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <div className="w-px h-4 bg-gray-300" />
        <input
          type="text"
          placeholder="Search for a room..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
        />
      </div>

      <div className="ml-auto">
        <FloorFilterDropdown
          selected={roomFilters.floor}
          onChange={(values) => onRoomFilterChange("floor", values)}
        />
      </div>
    </header>
  );
}
