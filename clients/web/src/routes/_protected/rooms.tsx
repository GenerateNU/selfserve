import { createFileRoute } from '@tanstack/react-router'
import { GuestPageShell } from '@/components/guests/GuestPageShell'

export const Route = createFileRoute('/_protected/rooms')({
  component: RoomsPage,
})

function RoomsPage() {
  return (
    <GuestPageShell title="Rooms">
      <p className="text-gray-600">Rooms page WIP...</p>
    </GuestPageShell>
  )
}
