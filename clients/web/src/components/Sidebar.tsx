import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Home, LayoutGrid, Octagon, Settings, UserRound } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { SettingsModal } from "./settings/SettingsModal";

function NavLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-bg-selected font-semibold text-subtle"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
      {children}
    </Link>
  );
}

function ProfileLink({ displayName }: { displayName: string | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === "/profile";
  return (
    <Link
      to="/profile"
      className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
        isActive ? "bg-bg-selected" : "hover:bg-bg-selected"
      }`}
    >
      <UserButton
        appearance={{
          elements: {
            avatarBox: "size-10",
          },
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-subtle">
          {displayName || "User"}
        </p>
        <p className="truncate text-xs text-primary">Hotel Chain</p>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { user } = useUser();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const displayName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <>
      <aside className="flex w-64 flex-col border-r border-stroke-subtle bg-white p-4">
        {/* LOGO */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Octagon
              className="size-3.5 text-white"
              fill="white"
              strokeWidth={1.5}
            />
          </div>
          <span className="text-lg font-bold text-gray-900">SelfServe</span>
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col gap-4">
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
        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <Settings className="size-5 shrink-0" strokeWidth={2} />
            Settings
          </button>
          <LogoutButton />
          <ProfileLink displayName={displayName} />
        </div>
      </aside>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
