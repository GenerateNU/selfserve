import type { RoomWithOptionalGuestBooking } from "@shared";
import { OverviewCard } from "@/components/rooms/OverviewCard";

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
    <aside className="w-1/4 shrink-0 min-h-0 overflow-y-auto px-6">
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
            { field: "Pending", value: cleaningRooms, description: "Tasks" },
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
      </div>
    </aside>
  );
}
