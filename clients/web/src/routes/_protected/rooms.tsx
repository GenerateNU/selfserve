import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageShell } from '@/components/ui/PageShell'
import { RoomsHeader } from '@/components/rooms/RoomsHeader'

export const Route = createFileRoute("/_protected/rooms")({
  component: RoomsPage,
});

function dummyRoomsQuery(selectedFloors: Array<number>) {
  return new Promise<Array<{ id: number; floor: number }>>((resolve) => {
    resolve(selectedFloors.map((f) => ({ id: f, floor: f })))
  })
}

function RoomsPage() {
  const [open, setOpen] = useState(false)
  const [selectedFloors, setSelectedFloors] = useState<Array<number>>([])

  const { data } = useQuery({
    queryKey: ['rooms', { floors: selectedFloors }],
    queryFn: () => dummyRoomsQuery(selectedFloors),
  })

  return (
    <PageShell
      header={
        <RoomsHeader
          onOpenDrawer={() => setOpen((o) => !o)}
          selectedFloors={selectedFloors}
          onChangeSelectedFloors={setSelectedFloors}
        />
      }
      drawerOpen={open}
      drawer={
        <div>
          <p>Drawer content</p>
        </div>
      }
    >
      <div>
        <ul>
          {data?.map((room) => (
            <li key={room.id}>Floor {room.floor} selected</li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
