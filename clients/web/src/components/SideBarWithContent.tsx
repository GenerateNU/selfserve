import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'

export function SideBarWithContent() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
