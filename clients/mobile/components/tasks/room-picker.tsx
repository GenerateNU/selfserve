import { useRef, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { DoorOpen, ChevronRight, Search, X } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { usePostRoomsHook } from "@shared/api/generated/endpoints/rooms/rooms";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { Colors } from "@/constants/theme";

const ICON_COLOR = Colors.light.textSubtle;

type RoomPickerProps = {
  value: RoomWithOptionalGuestBooking | undefined;
  onChange: (room: RoomWithOptionalGuestBooking | undefined) => void;
};

export function RoomPicker({ value, onChange }: RoomPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  const postRooms = usePostRoomsHook();

  const { data, isLoading } = useQuery({
    queryKey: ["rooms", "picker"],
    queryFn: () => postRooms({ limit: 200 }),
    enabled: expanded,
  });

  const allRooms = data?.items ?? [];
  const filtered = allRooms.filter((r) =>
    search ? String(r.room_number).includes(search) : true,
  );

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    setSearch("");
    if (next) setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSelect(room: RoomWithOptionalGuestBooking) {
    onChange(value?.id === room.id ? undefined : room);
    setExpanded(false);
    setSearch("");
  }

  const triggerLabel = value ? `Room ${value.room_number}` : undefined;

  return (
    <View className="gap-2">
      <Pressable
        onPress={handleToggle}
        className="flex-row items-center justify-between h-6"
      >
        <View className="flex-row items-center gap-1">
          <DoorOpen size={16} color={ICON_COLOR} />
          <Text className="text-[15px] text-text-subtle tracking-tight">
            Room
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text
            className={`text-[15px] tracking-tight ${triggerLabel ? "text-text-default" : "text-text-subtle"}`}
          >
            {triggerLabel ?? "Select..."}
          </Text>
          <ChevronRight
            size={14}
            color={ICON_COLOR}
            style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
          />
        </View>
      </Pressable>

      {expanded && (
        <View className="rounded border border-input-border">
          <View className="flex-row items-center gap-2.5 px-2 py-2 border-b border-input-border-light">
            <Search size={17} color={ICON_COLOR} />
            <View className="flex-row items-center flex-1 gap-1">
              {value && (
                <View className="flex-row items-center gap-1 bg-bg-selected rounded px-1.5 py-0.5">
                  <Text className="text-xs text-text-default tracking-tight">
                    Room {value.room_number}
                  </Text>
                  <Pressable onPress={() => onChange(undefined)} hitSlop={4}>
                    <X size={10} color={ICON_COLOR} />
                  </Pressable>
                </View>
              )}
              <TextInput
                ref={inputRef}
                className="flex-1 text-xs text-text-default tracking-tight"
                placeholder="Search by room number..."
                placeholderTextColor={ICON_COLOR}
                value={search}
                onChangeText={setSearch}
                keyboardType="numeric"
                returnKeyType="search"
              />
            </View>
          </View>

          {isLoading ? (
            <View className="px-4 py-3">
              <Text className="text-xs text-text-subtle tracking-tight">
                Loading...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-xs text-text-subtle tracking-tight">
                No rooms found
              </Text>
            </View>
          ) : (
            filtered.map((room) => (
              <Pressable
                key={room.id}
                onPress={() => handleSelect(room)}
                className={`px-4 py-2 ${value?.id === room.id ? "bg-bg-selected" : ""}`}
              >
                <Text className="text-xs text-text-default tracking-tight">
                  Room {room.room_number}
                </Text>
                {room.floor !== undefined && (
                  <Text className="text-xs text-text-subtle tracking-tight">
                    Floor {room.floor}
                  </Text>
                )}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
