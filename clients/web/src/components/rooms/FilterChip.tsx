import { cn } from "@/lib/utils";

type FilterChipProps = {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  className?: string;
};

export function FilterChip({
  label,
  isSelected,
  onToggle,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        className,
        "rounded border px-4 py-2 text-sm transition-colors",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-stroke-default bg-white text-text-secondary hover:border-primary hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}
