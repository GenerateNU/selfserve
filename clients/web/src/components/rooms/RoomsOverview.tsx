import type { Room } from '@/components/rooms/RoomsList'
import { OverviewCard } from '@/components/rooms/OverviewCard'

type RoomsOverviewProps = {
  rooms: Array<Room>
}

export function RoomsOverview({ rooms }: RoomsOverviewProps) {
  const totalRooms = rooms.length
  const hasTag = (room: Room, tag: string) => (room.tags ?? []).includes(tag)

  const occupiedRooms = rooms.filter((r) => hasTag(r, 'occupied')).length
  const cleaningRooms = rooms.filter((r) => hasTag(r, 'cleaning')).length
  const cleaningOnlyRooms = rooms.filter(
    (r) => hasTag(r, 'cleaning') && !hasTag(r, 'occupied'),
  ).length
  const occupiedAndCleaningRooms = rooms.filter(
    (r) => hasTag(r, 'occupied') && hasTag(r, 'cleaning'),
  ).length
  const vacantRooms = totalRooms - occupiedRooms

  return (
    <aside className="w-1/4 shrink-0 min-h-0 overflow-y-auto bg-white dark:bg-zinc-950 p-[2vw]">
      <div className="flex flex-col gap-[2.2vh]">
        <OverviewCard
          title="Tasks"
          columns={[
            { field: 'Urgent', value: 0, description: 'Tasks' },
            {
              field: 'Unassigned',
              value: cleaningOnlyRooms,
              description: 'Tasks',
            },
            { field: 'Pending', value: cleaningRooms, description: 'Tasks' },
          ]}
        />

        <OverviewCard
          title="Guest Flow"
          columns={[
            {
              field: 'Floor Occupancy',
              value: vacantRooms,
              description: 'Rooms left',
            },
            {
              field: 'Expected Arrivals',
              value: vacantRooms,
              description: 'Guests',
            },
            {
              field: 'Expected Departures',
              value: occupiedAndCleaningRooms,
              description: 'Guests',
            },
          ]}
        />
      </div>
    </aside>
  )
}
