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

type NavIconButtonProps = {
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
};

function NavIconLink({
  to,
  icon: Icon,
}: {
  to: string;
  icon: React.ElementType;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center justify-center rounded-md p-2 transition-colors",
        isActive
          ? "bg-bg-selected text-primary"
          : "text-text-subtle hover:bg-bg-container",
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
    </Link>
  );
}

function NavIconButton({ icon: Icon, active, onClick }: NavIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-md p-2 transition-colors",
        active
          ? "bg-bg-selected text-primary"
          : "text-text-subtle hover:bg-bg-container",
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}

type SidebarProps = {
  notifOpen: boolean;
  onNotifToggle: () => void;
};

export function Sidebar({ notifOpen, onNotifToggle }: SidebarProps) {
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
      <aside className="flex w-16.25 shrink-0 flex-col items-center border-r border-stroke-subtle bg-white py-5">
        {/* Logo */}
        <div className="mb-5 flex items-center justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Octagon
              className="size-3.5 text-white"
              fill="white"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col items-center gap-4">
          <NavIconLink to="/home" icon={Home} />
          <NavIconLink to="/rooms" icon={LayoutGrid} />
          <NavIconLink to="/guests" icon={UserRound} />
          <NavIconButton
            icon={Bell}
            active={notifOpen}
            onClick={onNotifToggle}
          />
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-3">
          <NavIconButton
            icon={Settings}
            onClick={() => setSettingsOpen(true)}
          />
          <NavIconButton icon={LogOut} onClick={() => setLogoutOpen(true)} />
          <button
            type="button"
            className="mt-1 overflow-hidden rounded-full"
            onClick={() => {}}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={initials}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-bg-selected text-xs font-medium text-text-default">
                {initials || "?"}
              </div>
            )}
          </button>
        </div>
      </aside>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {logoutOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
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
