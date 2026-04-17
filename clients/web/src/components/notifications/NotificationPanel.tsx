import { Filter, MoreVertical, Search } from "lucide-react";
import { useRef, useState } from "react";
import { useGetNotifications } from "@shared";
import { groupNotifications } from "./notification.utils";
import { NotificationItem } from "./NotificationItem";
import { FilterPopover } from "./FilterPopover";
import { MorePopover } from "./MorePopover";
import { cn } from "@/lib/utils";

type NotificationPanelProps = {
  open: boolean;
  sidebarExpanded: boolean;
};

export function NotificationPanel({
  open,
  sidebarExpanded,
}: NotificationPanelProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const moreContainerRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useGetNotifications();
  const groups = groupNotifications(notifications);

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
      </div>

      <div className="flex flex-col gap-6 px-6">
        {groups.length === 0 && (
          <p className="text-sm text-text-subtle">No notifications</p>
        )}
        {groups.map((group) => (
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
    </div>
  );
}
