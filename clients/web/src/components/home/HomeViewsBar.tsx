import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { View } from "@shared/types/views";

type HomeViewsBarProps = {
  views: View[];
  activeViewId?: string;
  onApply: (view: View) => void;
  onDelete: (id: string) => void;
};

export function HomeViewsBar({
  views,
  activeViewId,
  onApply,
  onDelete,
}: HomeViewsBarProps) {
  if (views.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-6 py-2 border-b border-stroke-subtle overflow-x-auto shrink-0">
      {views.map((view) => (
        <div
          key={view.id}
          className={cn(
            "flex items-center gap-1 rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors",
            view.id === activeViewId
              ? "bg-[#edf5f1] border-primary text-primary"
              : "bg-white border-stroke-default text-text-secondary hover:bg-bg-container",
          )}
        >
          <button
            type="button"
            onClick={() => onApply(view)}
            className="leading-none"
          >
            {view.display_name}
          </button>
          <button
            type="button"
            onClick={() => onDelete(view.id)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
