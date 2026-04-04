import { ChefHat, MoreHorizontal, Plus } from "lucide-react";
import type { ReactNode } from "react";

type KanbanColumnProps = {
  title: string;
  children: ReactNode;
};

export function KanbanColumn({ title, children }: KanbanColumnProps) {
  return (
    <div className="flex h-full min-h-0 w-max shrink-0 flex-col gap-3 rounded-t-2xl border border-b-0 border-stroke-subtle bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="size-5 text-text-default" />
          <span className="text-base font-semibold text-text-default">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            className="text-text-subtle hover:text-text-default transition-colors"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto *:shrink-0">
        {children}
      </div>
    </div>
  );
}
