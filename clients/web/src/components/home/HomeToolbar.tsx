import { ArrowDownUp, LayoutGrid, Search, Settings } from "lucide-react";
import type { View } from "@shared/types/views";
import { cn } from "@/lib/utils";

type HomeToolbarProps = {
  className?: string;
  onCreateRequest?: () => void;
  views?: Array<View>;
  activeViewId?: string;
  activeViewPending?: boolean;
  onSelectView?: (view: View | undefined) => void;
};

export function HomeToolbar({
  className,
  onCreateRequest,
  views = [],
  activeViewId,
  activeViewPending = false,
  onSelectView,
}: HomeToolbarProps) {
  return (
    <div className={cn("px-6", className)}>
      <div className="flex items-center justify-between border-b border-stroke-subtle">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onSelectView?.(undefined)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
              activeViewId === undefined
                ? "text-text-default border-b-2 border-text-default"
                : "text-text-subtle hover:text-text-default",
            )}
          >
            <LayoutGrid className="size-4" />
            Departments
          </button>
          {views.map((view) => {
            const isActive = view.id === activeViewId;
            const isPending = isActive && activeViewPending;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => onSelectView?.(view)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "text-text-default border-b-2 border-text-default"
                    : "text-text-subtle hover:text-text-default",
                )}
              >
                <LayoutGrid className="size-4" />
                {view.display_name}
                {isPending && (
                  <span className="size-1.5 rounded-full bg-current opacity-60" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
            <ArrowDownUp className="size-4" />
          </button>
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
            <Settings className="size-4" />
          </button>
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
