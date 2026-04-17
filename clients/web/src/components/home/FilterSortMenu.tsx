import { Check, X } from "lucide-react";

type FilterSortMenuProps = {
  options: Array<{ label: string; value: string }>;
  selected: string | undefined;
  anchor: { x: number; y: number };
  onApply: (value: string | undefined) => void;
  onClose: () => void;
};

export function FilterSortMenu({
  options,
  selected,
  anchor,
  onApply,
  onClose,
}: FilterSortMenuProps) {
  const selectedLabel = options.find((o) => o.value === selected)?.label;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-56 bg-white border border-stroke-subtle rounded-lg shadow-md overflow-hidden"
        style={{ left: anchor.x, top: anchor.y }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pl-4 pr-3 py-3 border-b border-stroke-subtle">
          <div className="min-w-0 flex-1">
            {selectedLabel && (
              <span className="inline-flex items-center gap-1 bg-bg-container rounded px-2 py-1 text-sm text-text-default">
                {selectedLabel}
                <button
                  type="button"
                  onClick={() => onApply(undefined)}
                  className="text-text-subtle hover:text-text-default"
                >
                  <X className="size-2" />
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onApply(undefined)}
            className="shrink-0 text-sm text-text-subtle hover:text-text-default transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Options */}
        <div>
          {options.map((option) => {
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onApply(option.value);
                  onClose();
                }}
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
