import { useState } from "react";
import { Text } from "react-native";
import { DoorOpen } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { usePostRoomsHook } from "@shared/api/generated/endpoints/rooms/rooms";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { SearchPicker } from "@/components/tasks/search-picker";

type RoomPickerProps = {
  value: RoomWithOptionalGuestBooking | undefined;
  onChange: (room: RoomWithOptionalGuestBooking | undefined) => void;
};

export function RoomPicker({ value, onChange }: RoomPickerProps) {
  const [search, setSearch] = useState("");
  const [queryEnabled, setQueryEnabled] = useState(false);

  const postRooms = usePostRoomsHook();

  const { data, isLoading } = useQuery({
    queryKey: ["rooms", "picker"],
    queryFn: () => postRooms({ limit: 200 }),
    enabled: queryEnabled,
  });

  const allRooms = data?.items ?? [];
  const filtered = allRooms.filter((r) =>
    search ? String(r.room_number).includes(search) : true,
  );

  function getRoomLabel(room: RoomWithOptionalGuestBooking) {
    return `Room ${room.room_number}`;
  }

  return (
    <SearchPicker
      icon={DoorOpen}
      label="Room"
      value={value}
      onChange={onChange}
      getKey={(r) => r.id ?? ""}
      getTriggerLabel={getRoomLabel}
      getChipLabel={getRoomLabel}
      renderRow={(room) => (
        <>
          <Text className="text-xs text-text-default tracking-tight">
            Room {room.room_number}
          </Text>
          {room.floor !== undefined && (
            <Text className="text-xs text-text-subtle tracking-tight">
              Floor {room.floor}
            </Text>
          )}
        </>
      )}
      items={filtered}
      isLoading={isLoading}
      search={search}
      onSearch={setSearch}
      onExpandChange={setQueryEnabled}
      searchPlaceholder="Search by room number..."
      keyboardType="numeric"
      emptyMessage="No rooms found"
    />
  );
}
