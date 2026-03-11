import { createFileRoute } from '@tanstack/react-router'
import { GuestPageShell } from '@/components/guests/GuestPageShell'

export const Route = createFileRoute('/_protected/home')({
  component: HomePage,
})

function HomePage() {
  return (
    <GuestPageShell title="Home">
      <p className="text-gray-600">Home page WIP...</p>
    </GuestPageShell>
  )
}
