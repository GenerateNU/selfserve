import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageShell } from '@/components/ui/PageShell'

export const Route = createFileRoute('/_protected/rooms')({
  component: RoomsPage,
})

function RoomsPage() {
  const [open, setOpen] = useState(false)
  return (
    <PageShell
      header={
        <div className="flex items-center justify-between h-full">
          <span className="text-[2vh] font-medium text-black">Rooms</span>
          <button
            onClick={() => setOpen(!open)}
            className="border border-gray-300 rounded text-sm"
          >
            Open
          </button>
        </div>
      }
      drawerOpen={open}
      drawer={
        <div>
          <p>Drawer content</p>
        </div>
      }
    >
      <div>
        <p>Main content goes here.</p>
      </div>
    </PageShell>
  )
}
