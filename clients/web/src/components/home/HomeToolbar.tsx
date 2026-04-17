import { useLayoutEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { View } from "@shared/types/views";
import { cn } from "@/lib/utils";
import { FilterListIcon } from "@/icons/filter-list";
import { SearchIcon } from "@/icons/search";
import { SettingsIcon } from "@/icons/settings";
import { TabIcon } from "@/icons/tab";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HomeToolbarProps = {
  className?: string;
  onCreateRequest?: () => void;
  views?: Array<View>;
  activeViewId?: string;
  activeViewPending?: boolean;
  filtersOpen?: boolean;
  filtersActive?: boolean;
  onToggleFilters?: () => void;
  onSelectView?: (view: View | undefined) => void;
  onDeleteView?: (view: View) => void;
  searchOpen?: boolean;
  searchValue?: string;
  onSearchOpenChange?: (open: boolean) => void;
  onSearchChange?: (value: string) => void;
};

const DEPARTMENTS_KEY = "__departments__";

export function HomeToolbar({
  className,
  onCreateRequest,
  views = [],
  activeViewId,
  activeViewPending = false,
  filtersOpen = false,
  filtersActive = false,
  onToggleFilters,
  onSelectView,
  onDeleteView,
  searchOpen = false,
  searchValue = "",
  onSearchOpenChange,
  onSearchChange,
}: HomeToolbarProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [underline, setUnderline] = useState({
    left: 0,
    width: 0,
    ready: false,
  });

  const activeKey = activeViewId ?? DEPARTMENTS_KEY;
  const activeView = views.find((v) => v.id === activeViewId);

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
              activeViewId === undefined
                ? "text-text-default"
                : "text-text-subtle hover:text-text-default",
            )}
          >
            <TabIcon className="size-4" />
            Departments
          </button>

          {views.map((view) => {
            const isActive = view.id === activeViewId;
            return (
              <ContextMenu key={view.id}>
                <ContextMenuTrigger asChild>
                  <button
                    ref={setTabRef(view.id)}
                    type="button"
                    onClick={() => onSelectView?.(view)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "text-text-default"
                        : "text-text-subtle hover:text-text-default",
                    )}
                  >
                    <TabIcon className="size-4" />
                    {view.display_name}
                    {isActive && activeViewPending && (
                      <span className="size-1.5 rounded-full bg-current opacity-60" />
                    )}
                  </button>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem
                    variant="destructive"
                    onSelect={() => onDeleteView?.(view)}
                  >
                    <Trash2 />
                    Delete view
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
                "relative rounded p-1 transition-colors",
                filtersOpen
                  ? "bg-primary-container text-primary"
                  : filtersActive
                    ? "text-primary hover:bg-primary-container"
                    : "text-text-subtle hover:text-text-default",
              )}
            >
              <FilterListIcon className="size-6" />
              {filtersActive && (
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (searchOpen) onSearchChange?.("");
                onSearchOpenChange?.(!searchOpen);
              }}
              className={cn(
                "relative rounded p-2 transition-colors",
                searchOpen
                  ? "bg-primary-container text-primary"
                  : searchValue
                    ? "text-primary hover:bg-primary-container"
                    : "text-text-subtle hover:text-text-default",
              )}
            >
              <SearchIcon className="size-4" />
            </button>

            {activeView ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-text-subtle hover:text-text-default transition-colors"
                  >
                    <SettingsIcon className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-36">
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onDeleteView?.(activeView)}
                  >
                    <Trash2 />
                    Delete view
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                className="text-text-subtle hover:text-text-default transition-colors"
              >
                <SettingsIcon className="size-4" />
              </button>
            )}
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

    <div
      className={cn(
        "grid transition-all duration-200 ease-out",
        searchOpen ? "grid-rows-[1fr] pb-3 pt-2 opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <SearchBar
          value={searchValue}
          onChange={(value) => onSearchChange?.(value)}
          placeholder="Search tasks..."
          autoFocus={searchOpen}
          className="w-full max-w-sm"
        />
      </div>
    </div>
    </div>
  );
}