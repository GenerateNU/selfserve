import { useDroppable } from "@dnd-kit/core";
import { Building2, MoreHorizontal, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type KanbanColumnProps = {
  title: string;
  children: ReactNode;
  droppableId: string;
};

export function KanbanColumn({ title, children, droppableId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 rounded-t-2xl border border-b-0 border-stroke-subtle bg-white p-4 h-full min-w-[22rem] transition-colors duration-150",
        isOver && "bg-bg-selected",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-text-default" />
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
      <div className="overflow-y-auto flex-1 min-h-0 pb-24">
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
