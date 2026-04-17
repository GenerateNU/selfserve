import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTagProps = {
  label: string;
  onRemove: () => void;
  className?: string;
};

export function FilterTag({ label, onRemove, className }: FilterTagProps) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full min-w-0 items-center justify-center gap-2 rounded border border-stroke-subtle bg-bg-primary px-2 py-1 text-text-default",
        className,
      )}
    >
      <span className="min-w-0 truncate text-sm leading-tight font-normal">
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "inline-flex size-4 items-center justify-center text-text-subtle transition-colors",
          "hover:text-text-default",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-white",
        )}
      >
        <X className="size-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
