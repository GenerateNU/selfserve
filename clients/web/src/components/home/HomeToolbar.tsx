import { ArrowDownUp, LayoutGrid, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { View } from "@shared/types/views";

type HomeToolbarProps = {
  className?: string;
  onCreateRequest?: () => void;
  views?: View[];
  activeViewId?: string;
  onSelectView?: (view: View | undefined) => void;
};

export function HomeToolbar({
  className,
  onCreateRequest,
  views = [],
  activeViewId,
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
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => onSelectView?.(view)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                view.id === activeViewId
                  ? "text-text-default border-b-2 border-text-default"
                  : "text-text-subtle hover:text-text-default",
              )}
            >
              <LayoutGrid className="size-4" />
              {view.display_name}
            </button>
          ))}
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
