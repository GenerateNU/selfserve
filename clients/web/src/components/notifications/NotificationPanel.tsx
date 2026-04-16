import { Bell, Filter, MoreVertical, Search, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { MOCK_NOTIFICATIONS } from "./notification.types";
import { NotificationItem } from "./NotificationItem";
import { FilterPopover } from "./FilterPopover";
import { MorePopover } from "./MorePopover";
import { cn } from "@/lib/utils";

type Tab = "notifications" | "complaints";

type NotificationPanelProps = {
  open: boolean;
  sidebarExpanded: boolean;
};

export function NotificationPanel({
  open,
  sidebarExpanded,
}: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("notifications");
  const [filterOpen, setFilterOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const moreContainerRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed top-0 z-50 flex h-screen w-100 flex-col gap-4 overflow-y-auto border-r border-stroke-subtle bg-bg-primary py-8 shadow-[4px_0px_8px_0px_rgba(0,0,0,0.1)] transition-[left] duration-200",
        sidebarExpanded ? "left-52" : "left-16.25",
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-stroke-subtle px-6 pb-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-default">Inbox</span>
          <div className="flex items-center gap-3.5 text-text-subtle">
            <button type="button" className="hover:text-text-default">
              <Search className="size-4" strokeWidth={2} />
            </button>

            <div className="relative" ref={filterContainerRef}>
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((o) => !o);
                  setMoreOpen(false);
                }}
                className={cn(
                  "hover:text-text-default",
                  filterOpen && "text-primary",
                )}
              >
                <Filter className="size-3.5" strokeWidth={2} />
              </button>
              {filterOpen && (
                <FilterPopover
                  onClose={() => setFilterOpen(false)}
                  containerRef={filterContainerRef}
                />
              )}
            </div>

            <div className="relative" ref={moreContainerRef}>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen((o) => !o);
                  setFilterOpen(false);
                }}
                className={cn(
                  "hover:text-text-default",
                  moreOpen && "text-primary",
                )}
              >
                <MoreVertical className="size-4" strokeWidth={2} />
              </button>
              {moreOpen && (
                <MorePopover
                  onClose={() => setMoreOpen(false)}
                  containerRef={moreContainerRef}
                />
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
              activeTab === "notifications"
                ? "border-b-2 border-primary text-primary"
                : "text-text-subtle hover:text-text-default",
            )}
          >
            <Bell className="size-3.5" strokeWidth={2} />
            Notifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("complaints")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
              activeTab === "complaints"
                ? "border-b-2 border-primary text-primary"
                : "text-text-subtle hover:text-text-default",
            )}
          >
            <UserRound className="size-3.5" strokeWidth={2} />
            Guest Complaints
          </button>
        </div>
      </div>

      {/* Notification list */}
      {activeTab === "notifications" && (
        <div className="flex flex-col gap-6 px-6">
          {MOCK_NOTIFICATIONS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="mb-1 text-xs text-primary">{group.label}</span>
              <div className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <NotificationItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "complaints" && (
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-text-subtle">No guest complaints</p>
        </div>
      )}
    </div>
  );
}
