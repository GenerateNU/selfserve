import { RoomCard } from '@/components/rooms/RoomCard'

export type Room = {
  id: string
  room_number: string
  floor: number
  room_type: string
  tags?: Array<string>
}

type RoomsListProps = {
  rooms: Array<Room>
  onRoomSelect: (roomId: string) => void
  selectedRoomId?: string | null
}

export function RoomsList({
  rooms,
  onRoomSelect,
  selectedRoomId = null,
}: RoomsListProps) {
  return (
    <section className="flex-1 min-h-0 p-[2vw] flex flex-col  overflow-hidden">
      <nav className="flex-1 min-h-0">
        <ul className="flex flex-col gap-1.5 h-full overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden">
          {rooms.map((room: Room) => (
            <li key={room.id} className="min-w-0">
              <RoomCard
                room={room}
                isSelected={selectedRoomId === room.id}
                onClick={() => onRoomSelect(room.id)}
              />
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
