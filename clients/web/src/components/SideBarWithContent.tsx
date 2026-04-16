import { useEffect, useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { NotificationPanel } from "./notifications/NotificationPanel";

export function SideBarWithContent() {
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setNotifOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        notifOpen={notifOpen}
        onNotifToggle={() => setNotifOpen((o) => !o)}
      />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <NotificationPanel open={notifOpen} />
    </div>
  );
}
