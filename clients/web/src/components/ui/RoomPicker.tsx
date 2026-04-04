import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePostRoomsHook } from "@shared/api/generated/endpoints/rooms/rooms";
import type { RoomWithOptionalGuestBooking } from "@shared";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchBar } from "@/components/ui/SearchBar";
import { cn, useDebounce } from "@/lib/utils";

type RoomPickerProps = {
  selectedRoom?: RoomWithOptionalGuestBooking;
  onSelect: (room: RoomWithOptionalGuestBooking) => void;
};

export function RoomPicker({ selectedRoom, onSelect }: RoomPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const postRooms = usePostRoomsHook();

  const { data, isLoading } = useQuery({
    queryKey: ["rooms", "picker"],
    queryFn: () => postRooms({ limit: 200 }),
    enabled: open,
  });

  const rooms = (data?.items ?? []).filter((room) =>
    debouncedSearch
      ? String(room.room_number).includes(debouncedSearch)
      : true,
  );

  function handleSelect(room: RoomWithOptionalGuestBooking) {
    onSelect(room);
    setOpen(false);
    setSearch("");
  }

  const triggerLabel = selectedRoom
    ? `Room ${selectedRoom.room_number}`
    : "No room";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-bg-selected",
          selectedRoom ? "text-text-default" : "text-text-subtle",
        )}
      >
        {triggerLabel}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-72 p-0"
      >
        <div className="border-b border-stroke-subtle p-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by room number..."
            autoFocus
          />
        </div>
        <div className="flex max-h-60 flex-col overflow-y-auto">
          {isLoading && (
            <p className="px-3 py-4 text-center text-sm text-text-subtle">
              Loading...
            </p>
          )}
          {!isLoading && rooms.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-text-subtle">
              No rooms found
            </p>
          )}
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => handleSelect(room)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bg-selected",
                selectedRoom?.id === room.id && "bg-bg-selected",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text-default">
                  Room {room.room_number}
                </p>
                {room.floor !== undefined && (
                  <p className="truncate text-xs text-text-subtle">
                    Floor {room.floor}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
