import { useEffect, useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { NotificationPanel } from "./notifications/NotificationPanel";

export function SideBarWithContent() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setNotifOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        notifOpen={notifOpen}
        onNotifToggle={() => setNotifOpen((o) => !o)}
        onHoverChange={setSidebarExpanded}
      />
      <main className="relative flex-1 overflow-auto">
        {notifOpen && (
          <div
            className="absolute inset-0 z-40"
            onClick={() => setNotifOpen(false)}
          />
        )}
        <Outlet />
      </main>
      <NotificationPanel open={notifOpen} sidebarExpanded={sidebarExpanded} />
    </div>
  );
}
