import { useGetRequestRoomId } from "@shared";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { RoomAccordion } from "@/components/rooms/RoomAccordion";
import { RoomRequestList } from "@/components/rooms/RoomRequestList";
import { RoomTabBar } from "@/components/rooms/RoomTabBar";

type RoomDetailsDrawerProps = {
  room: RoomWithOptionalGuestBooking | null;
  onClose: () => void;
};

export function RoomDetailsDrawer({ room, onClose }: RoomDetailsDrawerProps) {
  const { data } = useGetRequestRoomId(room?.id ?? "", {
    query: { enabled: room?.id != null },
  });

  if (!room) return null;

  const assignedItems = (data?.assigned ?? []).map((r) => ({
    ...r,
    isAssigned: true,
  }));
  const unassignedItems = data?.unassigned ?? [];
  const onAssignToSelf = (id: string) => {
    console.log("assigning to self", id);
  };
  
  const roomAccordionItems = [
    {
      value: "Your Tasks",
      trigger: "Your Tasks",
      content: <RoomRequestList requests={assignedItems} />,
    },
    {
      value: "Unassigned Tasks",
      trigger: "Unassigned Tasks",
      content: <RoomRequestList onAssignToSelf={onAssignToSelf} requests={unassignedItems} />,
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
