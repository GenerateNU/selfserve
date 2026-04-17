import { useAssignRequestToSelf, useGetRequestsOverview } from "@shared";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { OverviewCard } from "@/components/rooms/OverviewCard";
import { RoomRequestList } from "@/components/rooms/RoomRequestList";
import { useUnassignedTasks } from "@/hooks/use-unassigned-tasks";
import type { RoomsPageFilters } from "@/hooks/use-rooms-filters";

type RoomsOverviewProps = {
  rooms: Array<RoomWithOptionalGuestBooking>;
  filters: RoomsPageFilters;
};

export function RoomsOverview({ rooms, filters }: RoomsOverviewProps) {
  const { tasks: unassignedTasks } = useUnassignedTasks();
  const { mutate: onAssignToSelf } = useAssignRequestToSelf(undefined);
  const totalRooms = rooms.length;

  const occupiedRooms = rooms.filter(
    (r) => r.booking_status === "active",
  ).length;
  const occupiedAndCleaningRooms = rooms.filter(
    (r) => r.booking_status === "active" && r.room_status === "cleaning",
  ).length;
  const vacantRooms = totalRooms - occupiedRooms;

  const { data: overview } = useGetRequestsOverview({
    floors: filters.floors.length > 0 ? filters.floors : undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    attributes: filters.attributes.length > 0 ? filters.attributes : undefined,
    advanced: filters.advanced.length > 0 ? filters.advanced : undefined,
  });

  return (
    <aside className="w-full max-w-[24.875rem] shrink-0 min-h-0 flex flex-col px-6">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <OverviewCard
            title="Tasks"
            columns={[
              {
                field: "Urgent",
                value: overview?.urgent ?? 0,
                description: "Tasks",
                urgent: true,
              },
              {
                field: "Unassigned",
                value: overview?.unassigned ?? 0,
                description: "Tasks",
              },
              {
                field: "Pending",
                value: overview?.pending ?? 0,
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
        </div>
        <RoomRequestList
          title="Unassigned Tasks"
          onAssignToSelf={onAssignToSelf}
          requests={unassignedTasks}
          className="flex-1 min-h-0"
        />
      </div>
    </aside>
  );
}
