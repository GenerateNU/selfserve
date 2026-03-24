import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type FilterTagProps = {
  label: string;
  onRemove: () => void;
  className?: string;
};

export function FilterTag({ label, onRemove, className }: FilterTagProps) {
  return (
    <div
      className={cn(
        className,
        "inline-flex items-center gap-1 rounded-md border border-stroke-default pl-4 pr-3 py-1.5 text-sm text-text-default transition-colors",
      )}
    >
      {label}
      <button type="button" onClick={onRemove} className="text-text-subtle hover:text-text-default">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}