import type { RoomWithOptionalGuestBooking } from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";
import { RoomAccordion } from "@/components/rooms/RoomAccordion";
import { RoomRequestList } from "@/components/rooms/RoomRequestList";
import { RoomTabBar } from "@/components/rooms/RoomTabBar";

type RoomDetailsDrawerProps = {
  room: RoomWithOptionalGuestBooking | null;
  onClose: () => void;
};

const roomAccordionItems = [
  {
    value: "Open Issues",
    trigger: "Open Issues",
    content:
      "Manage how you receive notifications. You can enable email alerts for updates or push notifications for mobile devices.",
  },
  {
    value: "Your Tasks",
    trigger: "Your Tasks",
    content: (
      <RoomRequestList
        requests={[
          {
            id: "1",
            title: "Task 1",
            roomNumber: 101,
            floor: 1,
            department: "Maintenance",
            priority: "high",
            assignedTo: "Eric",
          },
        ]}
      />
    ),
  },
  {
    value: "Unassigned Tasks",
    trigger: "Unassigned Tasks",
    content: (
      <RoomRequestList
        requests={[
          {
            id: "2",
            title: "Task 2",
            roomNumber: 102,
            floor: 1,
            department: "Maintenance",
            priority: "medium",
          },
        ]}
      />
    ),
  },
];

export function RoomDetailsDrawer({ room, onClose }: RoomDetailsDrawerProps) {
  if (!room) return null;

  return (
    <DrawerShell
      title={`Room ${room.room_number}`}
      onClose={onClose}
      className="px-2 py-0"
    >
      <RoomTabBar />
      <RoomAccordion
        items={roomAccordionItems}
        defaultValue={["Open Issues", "Your Tasks", "billing"]}
      />
    </DrawerShell>
  );
}
