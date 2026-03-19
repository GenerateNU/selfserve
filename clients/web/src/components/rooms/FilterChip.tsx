import { cn } from "@/lib/utils";

type FilterChipProps = {
  label: string;
  isSelected: boolean;
};

export function FilterChip({ label, isSelected }: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
      )}
    >
      {label}
    </button>
  );
}
