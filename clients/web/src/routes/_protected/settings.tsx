import { createFileRoute } from '@tanstack/react-router'
import { GuestPageShell } from '@/components/guests/GuestPageShell'

export const Route = createFileRoute('/_protected/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <GuestPageShell title="Settings">
      <p className="text-gray-600">Settings page WIP...</p>
    </GuestPageShell>
  )
}
