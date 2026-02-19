import { Link } from '@tanstack/react-router'
import { UserButton } from '@clerk/clerk-react'

export function Sidebar() {
  return (
    <aside className="w-64 flex flex-col border-r bg-muted/40 p-4">
      <nav className="flex flex-col gap-2 flex-1">
        <Link to="/guests" activeProps={{ className: 'font-semibold' }}>
          Guests
        </Link>
        <Link to="/test-api" activeProps={{ className: 'font-semibold' }}>
          Test API
        </Link>
      </nav>
      <div className="pt-4 mt-auto border-t">
        <UserButton />
      </div>
    </aside>
  )
}
