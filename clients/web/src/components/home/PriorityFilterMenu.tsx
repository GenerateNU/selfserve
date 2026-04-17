import { Check, X } from "lucide-react";

const PRIORITY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

type PriorityFilterMenuProps = {
  selectedPriorities: Array<string>;
  anchor: { x: number; y: number };
  onApply: (priorities: Array<string>) => void;
  onClose: () => void;
};

export function PriorityFilterMenu({
  selectedPriorities,
  anchor,
  onApply,
  onClose,
}: PriorityFilterMenuProps) {
  function toggle(value: string) {
    onApply(
      selectedPriorities.includes(value)
        ? selectedPriorities.filter((p) => p !== value)
        : [...selectedPriorities, value],
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-56 bg-white border border-stroke-subtle rounded-lg shadow-md overflow-hidden"
        style={{ left: anchor.x, top: anchor.y }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pl-4 pr-3 py-3 border-b border-stroke-subtle min-h-[48px]">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedPriorities.map((value) => {
              const label =
                PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
              return (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 bg-bg-container rounded px-2 py-1 text-sm text-text-default"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => toggle(value)}
                    className="text-text-subtle hover:text-text-default"
                  >
                    <X className="size-2" />
                  </button>
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onApply([])}
            className="shrink-0 text-sm text-text-subtle hover:text-text-default transition-colors ml-2"
          >
            Clear
          </button>
        </div>

        {/* Options */}
        <div>
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = selectedPriorities.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-default hover:bg-bg-container transition-colors"
              >
                <span
                  className={`shrink-0 size-4 rounded-sm border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-stroke-default bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="size-3 text-white" strokeWidth={3} />
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
