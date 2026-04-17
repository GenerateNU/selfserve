type AssistanceChipProps = {
  label: string;
};

export function AssistanceChip({ label }: AssistanceChipProps) {
  return (
    <span className="inline-flex items-center rounded border border-high-priority bg-bg-high-priority px-2 py-1 text-xs text-high-priority">
      {label}
    </span>
  );
}
