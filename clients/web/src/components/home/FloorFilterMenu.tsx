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
  const { data: floors = [], isLoading } = useGetRoomsFloors();

  function toggle(floor: number) {
    onApply(
      selectedFloors.includes(floor)
        ? selectedFloors.filter((f) => f !== floor)
        : [...selectedFloors, floor],
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
            {selectedFloors.map((floor) => (
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
            onClick={() => onApply([])}
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
            const isSelected = selectedFloors.includes(floor);
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
      </div>
    </>
  );
}
