import { useAssignRequestToSelf } from "@shared";
import type { RoomWithOptionalGuestBooking } from "@shared";
import { OverviewCard } from "@/components/rooms/OverviewCard";
import { RoomRequestList } from "@/components/rooms/RoomRequestList";
import { useUnassignedTasks } from "@/hooks/use-unassigned-tasks";

type RoomsOverviewProps = {
  rooms: Array<RoomWithOptionalGuestBooking>;
  floors: Array<number>;
};

export function RoomsOverview({ rooms, floors }: RoomsOverviewProps) {
  const { tasks: unassignedTasks, data } = useUnassignedTasks({ floors });
  const { mutate: onAssignToSelf } = useAssignRequestToSelf(undefined);

  const feedItems = data?.pages.flatMap((p) => p.items ?? []) ?? [];
  const urgentCount = feedItems.filter((t) => t.priority === "high").length;
  const pendingCount = feedItems.filter((t) => t.status === "pending").length;

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(
    (r) => r.booking_status === "active",
  ).length;

  return (
    <aside className="w-full max-w-99.5 shrink-0 min-h-0 flex flex-col px-6">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <OverviewCard
            title="Tasks"
            columns={[
              {
                field: "Urgent",
                value: urgentCount,
                description: "Tasks",
                urgent: true,
              },
              {
                field: "Unassigned",
                value: feedItems.length,
                description: "Tasks",
              },
              {
                field: "Pending",
                value: pendingCount,
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
                value: "—",
                description: "Guests",
              },
              {
                field: "Expected Departures",
                value: "—",
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
