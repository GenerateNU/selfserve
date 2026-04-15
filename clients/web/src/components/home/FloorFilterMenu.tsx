import { useState } from "react";
import { Check, X } from "lucide-react";
import { useGetRoomsFloors } from "@shared";

type FloorFilterMenuProps = {
  selectedFloors: Array<number>;
  anchor: { x: number; y: number };
  onApply: (floors: Array<number>) => void;
  onClose: () => void;
};

export function FloorFilterMenu({
  selectedFloors,
  anchor,
  onApply,
  onClose,
}: FloorFilterMenuProps) {
  const [draft, setDraft] = useState<Array<number>>(selectedFloors);

  const { data: floors = [], isLoading } = useGetRoomsFloors();

  function toggle(floor: number) {
    setDraft((prev) =>
      prev.includes(floor) ? prev.filter((f) => f !== floor) : [...prev, floor],
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
            {draft.map((floor) => (
              <span
                key={floor}
                className="inline-flex items-center gap-1 bg-bg-container rounded px-2 py-1 text-sm text-text-default"
              >
                Floor {floor}
                <button
                  type="button"
                  onClick={() => toggle(floor)}
                  className="text-text-subtle hover:text-text-default"
                >
                  <X className="size-2" />
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDraft([])}
            className="shrink-0 text-sm text-text-subtle hover:text-text-default transition-colors ml-2"
          >
            Clear
          </button>
        </div>

        {/* Floors list */}
        <div className="max-h-52 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-3 text-sm text-text-subtle text-center">
              Loading...
            </p>
          )}
          {!isLoading && floors.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-subtle text-center">
              No floors found
            </p>
          )}
          {floors.map((floor) => {
            const isSelected = draft.includes(floor);
            return (
              <button
                key={floor}
                type="button"
                onClick={() => toggle(floor)}
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
                Floor {floor}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-3 border-t border-stroke-subtle">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-bg-container rounded px-6 py-2.5 text-sm text-text-default hover:bg-bg-selected transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="flex-1 bg-primary rounded px-6 py-2.5 text-sm text-white hover:bg-primary-hover transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </>
  );
}
