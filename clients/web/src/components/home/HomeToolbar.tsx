import { ArrowDownUp, LayoutGrid, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type HomeToolbarProps = {
  className?: string;
  onCreateRequest?: () => void;
};

const TABS = ["Departments", "View 2", "View 3"];

export function HomeToolbar({ className, onCreateRequest }: HomeToolbarProps) {
  return (
    <div className={cn("px-6", className)}>
      <div className="flex items-center justify-between border-b border-stroke-subtle">
        <div className="flex items-center">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                i === 0
                  ? "text-text-default border-b-2 border-text-default"
                  : "text-text-subtle hover:text-text-default"
              }`}
            >
              <LayoutGrid className="size-4" />
              {tab}
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
