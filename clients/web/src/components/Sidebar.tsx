import { Link, useRouterState } from '@tanstack/react-router'
import { SignOutButton, UserButton, useUser } from '@clerk/clerk-react'
import {
  Home,
  LayoutGrid,
  UserRound,
  Settings,
  LogOut,
  Octagon,
} from 'lucide-react'

function NavLink({
  to,
  icon: Icon,
  children,
}: {
  to: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to))
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-primary/10 font-semibold text-gray-900'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
      {children}
    </Link>
  )
}

export function Sidebar() {
  const { user } = useUser()

  const displayName =
    user?.fullName ?? [user?.firstName, user?.lastName].filter(Boolean).join(' ')

  return (
    <aside className="flex w-64 flex-col border-r bg-white p-4">
      {/* LOGO */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Octagon className="size-5 text-white" fill="white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-gray-900">SelfServe</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-1">
        <NavLink to="/home" icon={Home}>
          Home
        </NavLink>
        <NavLink to="/rooms" icon={LayoutGrid}>
          Room
        </NavLink>
        <NavLink to="/guests" icon={UserRound}>
          Guest
        </NavLink>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-1 border-t pt-4">
        <NavLink to="/settings" icon={Settings}>
          Settings
        </NavLink>
        <SignOutButton>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="size-5 shrink-0" />
            Logout
          </button>
        </SignOutButton>
        <div className="flex items-center gap-3 pt-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'size-10',
              },
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-700">
              {displayName || 'User'}
            </p>
            <p className="truncate text-xs text-gray-500">
              {typeof user?.publicMetadata?.organization === 'string'
                ? user.publicMetadata.organization
                : 'Hotel Chain'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
