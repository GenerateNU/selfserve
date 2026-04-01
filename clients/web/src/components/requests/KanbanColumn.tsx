import { CheckCircle, Clock, MoreHorizontal, Plus, UserCheck } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

const COLUMN_ICONS: Record<string, ComponentType<LucideProps>> = {
  Pending: Clock,
  Assigned: UserCheck,
  Completed: CheckCircle,
};

type KanbanColumnProps = {
  title: string;
  children: ReactNode;
};

export function KanbanColumn({ title, children }: KanbanColumnProps) {
  const Icon = COLUMN_ICONS[title] ?? Clock;
  return (
    <div className="flex flex-col gap-3 rounded-t-2xl border border-b-0 border-stroke-subtle bg-white p-4 h-full min-w-[22rem]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-text-default" />
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
      <div className="overflow-y-auto flex-1 min-h-0">
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
