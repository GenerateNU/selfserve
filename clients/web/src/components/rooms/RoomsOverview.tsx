import type { RoomWithOptionalGuestBooking } from "@shared";
import { OverviewCard } from "@/components/rooms/OverviewCard";
import { RoomRequestList } from "@/components/rooms/RoomRequestList";

type RoomsOverviewProps = {
  rooms: Array<RoomWithOptionalGuestBooking>;
};
// TODO: Replace with hifi (this is just to confirm the data is correct for us to ship rooms list)
export function RoomsOverview({ rooms }: RoomsOverviewProps) {
  const totalRooms = rooms.length;

  const occupiedRooms = rooms.filter(
    (r) => r.booking_status === "active",
  ).length;
  const cleaningRooms = rooms.filter(
    (r) => r.room_status === "cleaning",
  ).length;
  const cleaningOnlyRooms = rooms.filter(
    (r) => r.room_status === "cleaning" && r.booking_status !== "active",
  ).length;
  const occupiedAndCleaningRooms = rooms.filter(
    (r) => r.booking_status === "active" && r.room_status === "cleaning",
  ).length;
  const vacantRooms = totalRooms - occupiedRooms;

  return (
    <aside className="w-full max-w-[24.875rem] shrink-0 min-h-0 overflow-y-auto px-6">
      <div className="flex flex-col">
        <OverviewCard
          title="Tasks"
          columns={[
            {
              field: "Urgent",
              value: 0,
              description: "Tasks",
              urgent: true,
            },
            {
              field: "Unassigned",
              value: cleaningOnlyRooms,
              description: "Tasks",
            },
            {
              field: "Pending",
              value: cleaningRooms,
              description: "Tasks",
            },
          ]}
        />

        <OverviewCard
          title="Guest Flow"
          columns={[
            {
              field: "Floor Occupancy",
              value: occupiedRooms,
              valueSecondary: totalRooms,
              description: "Rooms occupied",
            },
            {
              field: "Expected Arrivals",
              value: vacantRooms,
              description: "Guests",
            },
            {
              field: "Expected Departures",
              value: occupiedAndCleaningRooms,
              description: "Guests",
            },
          ]}
        />
        <RoomRequestList
          title="Unassigned Tasks"
          requests={[
            {
              id: "1",
              title: "Room 101",
              floor: 1,
              roomNumber: 101,
              department: "Maintenance",
              priority: "low",
            },
            {
              id: "2",
              title: "Room 102",
              floor: 1,
              roomNumber: 102,
              department: "Maintenance",
              priority: "medium",
              assignedTo: "John Doe",
            },
          ]}
        />
      </div>
    </aside>
  );
}
