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
        "rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-stroke-subtle bg-white text-text-default hover:border-primary",
      )}
    >
      {label}
    </button>
  );
}
