import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RoomsHeader } from '@/components/rooms/RoomsHeader'
import { RoomsOverview } from '@/components/rooms/RoomsOverview'
import { RoomsList } from '@/components/rooms/RoomsList'
import { rooms } from '@/data/rooms'

export const Route = createFileRoute('/rooms')({ component: RoomsPage })

export type RoomFilters = {
  floor: Array<number>
}

const initialRoomFilters: RoomFilters = {
  floor: [],
}

export default function RoomsPage() {
  const [roomFilters, setRoomFilters] =
    useState<RoomFilters>(initialRoomFilters)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const updateRoomFilter = <TKey extends keyof RoomFilters>(
    key: TKey,
    value: RoomFilters[TKey],
  ) => {
    setRoomFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <RoomsHeader
        roomFilters={roomFilters}
        onRoomFilterChange={updateRoomFilter}
      />

      <section className="flex flex-1 min-h-0">
        <RoomsList
          rooms={rooms}
          onRoomSelect={setSelectedRoomId}
          selectedRoomId={selectedRoomId}
        />
        <RoomsOverview rooms={rooms} />
      </section>
    </main>
  )
}
