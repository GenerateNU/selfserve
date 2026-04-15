import { X } from "lucide-react";

type AssistanceChipProps = {
  label: string;
};

export function AssistanceChip({ label }: AssistanceChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-high-priority bg-bg-high-priority px-2 py-1 text-xs text-high-priority">
      {label}
      <X className="size-3.5 text-high-priority" strokeWidth={2} />
    </span>
  );
}
