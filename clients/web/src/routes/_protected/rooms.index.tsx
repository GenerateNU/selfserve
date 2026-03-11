import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RoomsHeader } from '@/components/rooms/RoomsHeader'
import { RoomsOverview } from '@/components/rooms/RoomsOverview'
import { RoomsList } from '@/components/rooms/RoomsList'
import { RoomDetailsDrawer } from '@/components/rooms/RoomDetailsDrawer'
import { rooms } from '@/mock-data/rooms'

export const Route = createFileRoute('/_protected/rooms/')({
  component: RoomsPage,
})

export type RoomFilters = {
  floor: Array<number>
}

const initialRoomFilters: RoomFilters = {
  floor: [],
}

function RoomsPage() {
  const [roomFilters, setRoomFilters] =
    useState<RoomFilters>(initialRoomFilters)

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const filteredRooms = useMemo(() => {
    let result = rooms

    if (roomFilters.floor.length > 0) {
      result = result.filter((r) => roomFilters.floor.includes(r.floor))
    }

    return result
  }, [roomFilters])

  const selectedRoom =
    selectedRoomId == null
      ? null
      : (rooms.find((r) => r.id === selectedRoomId) ?? null)

  const toggleRoom = (roomId: string) => {
    setSelectedRoomId((prev) => (prev === roomId ? null : roomId))
  }

  const updateRoomFilter = <TKey extends keyof RoomFilters>(
    key: TKey,
    value: RoomFilters[TKey],
  ) => {
    setRoomFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleCloseDrawer = () => {
    setSelectedRoomId(null)
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <RoomsHeader
        roomFilters={roomFilters}
        onRoomFilterChange={updateRoomFilter}
      />

      <section className="flex flex-1 min-h-0">
        <RoomsList
          rooms={filteredRooms}
          onRoomSelect={toggleRoom}
          selectedRoomId={selectedRoomId}
        />
        <RoomsOverview rooms={filteredRooms} />
      </section>
      <RoomDetailsDrawer room={selectedRoom} onClose={handleCloseDrawer} />
    </main>
  )
}
