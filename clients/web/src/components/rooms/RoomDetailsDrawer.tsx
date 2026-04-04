import type { GuestRequest, RoomWithOptionalGuestBooking } from "@shared";
import { useGetRequestRoomId } from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { RoomAccordion } from "@/components/rooms/RoomAccordion";
import { RoomRequestList } from "@/components/rooms/RoomRequestList";
import type { RoomRequestItem } from "@/components/rooms/RoomRequestList";
import { RoomTabBar } from "@/components/rooms/RoomTabBar";

type RoomDetailsDrawerProps = {
  room: RoomWithOptionalGuestBooking | null;
  onClose: () => void;
};

function toRoomRequestItem(req: GuestRequest, isAssigned: boolean): RoomRequestItem {
  return {
    id: req.id ?? "",
    title: req.name ?? "",
    roomNumber: req.room_number ?? undefined,
    department: req.request_category ?? req.request_type ?? undefined,
    priority: req.priority as RoomRequestItem["priority"],
    assignedTo: isAssigned ? "me" : undefined,
  };
}

export function RoomDetailsDrawer({ room, onClose }: RoomDetailsDrawerProps) {
  const { data, isLoading } = useGetRequestRoomId(room?.id ?? "", {
    query: { enabled: room?.id != null },
  });

  if (!room) return null;

  const assignedItems = (data?.assigned ?? []).map((r) =>
    toRoomRequestItem(r, true),
  );
  const unassignedItems = (data?.unassigned ?? []).map((r) =>
    toRoomRequestItem(r, false),
  );

  const roomAccordionItems = [
    {
      value: "Your Tasks",
      trigger: "Your Tasks",
      content: isLoading ? (
        <p className="text-sm text-text-subtle">Loading…</p>
      ) : (
        <RoomRequestList requests={assignedItems} />
      ),
    },
    {
      value: "Unassigned Tasks",
      trigger: "Unassigned Tasks",
      content: isLoading ? (
        <p className="text-sm text-text-subtle">Loading…</p>
      ) : (
        <RoomRequestList requests={unassignedItems} />
      ),
    },
  ];

  return (
    <DrawerShell
      title={`Room ${room.room_number}`}
      onClose={onClose}
      className="px-2 py-0"
    >
      <RoomTabBar />
      <RoomAccordion
        items={roomAccordionItems}
        defaultValue={["Your Tasks", "Unassigned Tasks"]}
      />
    </DrawerShell>
  );
}
