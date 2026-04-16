import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Home,
  LayoutGrid,
  LogOut,
  Octagon,
  Settings,
  UserRound,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { SettingsModal } from "./settings/SettingsModal";
import { cn } from "@/lib/utils";

function NavLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={cn(
        "flex w-full items-center gap-4 rounded-md px-4 py-2 transition-colors",
        isActive
          ? "bg-bg-selected text-primary"
          : "text-text-subtle hover:bg-bg-container",
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
      <span className="whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-md px-4 py-2 transition-colors",
        active
          ? "bg-bg-selected text-primary"
          : "text-text-subtle hover:bg-bg-container",
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
      <span className="whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

type SidebarProps = {
  notifOpen: boolean;
  onNotifToggle: () => void;
  onHoverChange: (hovered: boolean) => void;
};

export function Sidebar({
  notifOpen,
  onNotifToggle,
  onHoverChange,
}: SidebarProps) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const avatarUrl = user?.imageUrl;
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <>
      <aside
        className="group flex w-16.25 shrink-0 flex-col justify-between overflow-hidden border-r border-stroke-subtle bg-white py-5 transition-[width] duration-200 ease-in-out hover:w-52"
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
      >
        <div className="flex flex-col gap-5">
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Octagon
                className="size-3.5 text-white"
                fill="white"
                strokeWidth={1.5}
              />
            </div>
            <span className="whitespace-nowrap text-xl font-bold text-text-default opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              SelfServe
            </span>
          </div>

          {/* Main nav */}
          <nav className="flex flex-col gap-1 px-2">
            <NavLink to="/home" icon={Home} label="Home" />
            <NavLink to="/rooms" icon={LayoutGrid} label="Room" />
            <NavLink to="/guests" icon={UserRound} label="Guest" />
            <NavItem
              icon={Bell}
              label="Notifications"
              active={notifOpen}
              onClick={onNotifToggle}
            />
          </nav>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-1 px-2">
          <NavItem
            icon={Settings}
            label="Settings"
            onClick={() => setSettingsOpen(true)}
          />
          <NavItem
            icon={LogOut}
            label="Logout"
            onClick={() => setLogoutOpen(true)}
          />

          {/* Profile */}
          <div className="mt-1 flex items-center gap-3 px-2 py-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={initials}
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-selected text-xs font-medium text-text-default">
                {initials || "?"}
              </div>
            )}
            <div className="flex flex-col opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <span className="whitespace-nowrap text-xs font-medium text-text-default">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="whitespace-nowrap text-xs text-text-subtle">
                Hotel Chain
              </span>
            </div>
          </div>
        </div>
      </aside>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {logoutOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-[20px] font-bold text-text-default">
              Are you sure you want to log out?
            </h2>
            <p className="mt-2 text-[16px] text-text-secondary">
              You'll be signed out and can log back in anytime.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="px-4 py-2 text-[14px] font-medium text-text-secondary hover:text-text-default"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg bg-primary px-5 py-2 text-[14px] font-semibold text-white hover:bg-primary-hover"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
