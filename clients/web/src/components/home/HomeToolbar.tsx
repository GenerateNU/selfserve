import { useLayoutEffect, useRef, useState } from "react";
import { ListFilter, Search, Settings } from "lucide-react";
import type { View } from "@shared/types/views";
import { cn } from "@/lib/utils";

type HomeToolbarProps = {
  className?: string;
  onCreateRequest?: () => void;
  views?: Array<View>;
  activeViewId?: string;
  activeViewPending?: boolean;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  onSelectView?: (view: View | undefined) => void;
};

const DEPARTMENTS_KEY = "__departments__";

function TabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M5.5 2.5C5.5 1.11929 6.61929 0 8 0C9.38071 0 10.5 1.11929 10.5 2.5C10.5 3.88071 9.38071 5 8 5C6.61929 5 5.5 3.88071 5.5 2.5Z" fill="currentColor" />
      <path d="M5.5 13.5C5.5 12.1193 6.61929 11 8 11C9.38071 11 10.5 12.1193 10.5 13.5C10.5 14.8807 9.38071 16 8 16C6.61929 16 5.5 14.8807 5.5 13.5Z" fill="currentColor" />
      <path d="M0 8C0 6.61929 1.11929 5.5 2.5 5.5C3.88071 5.5 5 6.61929 5 8C5 9.38071 3.88071 10.5 2.5 10.5C1.11929 10.5 0 9.38071 0 8Z" fill="currentColor" />
      <path d="M11 8C11 6.61929 12.1193 5.5 13.5 5.5C14.8807 5.5 16 6.61929 16 8C16 9.38071 14.8807 10.5 13.5 10.5C12.1193 10.5 11 9.38071 11 8Z" fill="currentColor" />
    </svg>
  );
}

export function HomeToolbar({
  className,
  onCreateRequest,
  views = [],
  activeViewId,
  activeViewPending = false,
  filtersOpen = false,
  onToggleFilters,
  onSelectView,
}: HomeToolbarProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [underline, setUnderline] = useState({ left: 0, width: 0, ready: false });

  const activeKey = activeViewId ?? DEPARTMENTS_KEY;

  useLayoutEffect(() => {
    const activeTab = tabButtonRefs.current.get(activeKey);
    const container = tabsRef.current;
    if (!activeTab || !container) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    setUnderline({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
      ready: true,
    });
  }, [activeKey]);

  function setTabRef(key: string) {
    return (el: HTMLButtonElement | null) => {
      if (el) tabButtonRefs.current.set(key, el);
      else tabButtonRefs.current.delete(key);
    };
  }

  return (
    <div className={cn("px-6 border-b border-stroke-subtle", className)}>
      <div className="flex items-end justify-between">
        <div ref={tabsRef} className="relative flex items-start">
          <button
            ref={setTabRef(DEPARTMENTS_KEY)}
            type="button"
            onClick={() => onSelectView?.(undefined)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
              activeViewId === undefined ? "text-text-default" : "text-text-subtle hover:text-text-default",
            )}
          >
            <TabIcon className="size-4" />
            Departments
          </button>
          {views.map((view) => {
            const isActive = view.id === activeViewId;
            return (
              <button
                key={view.id}
                ref={setTabRef(view.id)}
                type="button"
                onClick={() => onSelectView?.(view)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  isActive ? "text-text-default" : "text-text-subtle hover:text-text-default",
                )}
              >
                <TabIcon className="size-4" />
                {view.display_name}
                {isActive && activeViewPending && (
                  <span className="size-1.5 rounded-full bg-current opacity-60" />
                )}
              </button>
            );
          })}
          {underline.ready && (
            <div
              className="absolute bottom-0 h-0.5 bg-text-default transition-all duration-200 ease-out"
              style={{ left: underline.left, width: underline.width }}
            />
          )}
        </div>
        <div className="flex items-center gap-6 py-2">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onToggleFilters}
              className={cn(
                "transition-colors",
                filtersOpen ? "text-text-default" : "text-text-subtle hover:text-text-default",
              )}
            >
              <ListFilter className="size-6" />
            </button>
            <button
              type="button"
              className="text-text-subtle hover:text-text-default transition-colors"
            >
              <Search className="size-6" />
            </button>
            <button
              type="button"
              className="text-text-subtle hover:text-text-default transition-colors"
            >
              <Settings className="size-6" />
            </button>
          </div>
          <button
            type="button"
            onClick={onCreateRequest}
            className="rounded bg-primary px-6 py-2.5 text-sm text-white hover:bg-primary-hover transition-colors"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
