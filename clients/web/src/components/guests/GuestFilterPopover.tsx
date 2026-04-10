import { Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type GuestFilterPopoverProps = {
  availableFloors: Array<number>;
  availableGroupSizes: Array<number>;
  selectedFloor: string;
  selectedGroupSize: string;
  onApply: (floor: string, groupSize: string) => void;
};

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-4 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-stroke-subtle bg-white text-text-default hover:border-primary",
      )}
    >
      {label}
    </button>
  );
}

export function GuestFilterPopover({
  availableFloors,
  availableGroupSizes,
  selectedFloor,
  selectedGroupSize,
  onApply,
}: GuestFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pendingFloor, setPendingFloor] = useState(selectedFloor);
  const [pendingGroupSize, setPendingGroupSize] = useState(selectedGroupSize);

  const handleOpen = () => {
    setPendingFloor(selectedFloor);
    setPendingGroupSize(selectedGroupSize);
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleApply = () => {
    onApply(pendingFloor, pendingGroupSize);
    setOpen(false);
  };

  const handleReset = () => {
    setPendingFloor("all");
    setPendingGroupSize("all");
  };

  const activeFilterCount =
    (selectedFloor !== "all" ? 1 : 0) + (selectedGroupSize !== "all" ? 1 : 0);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={open ? handleCancel : handleOpen}
        className={cn(
          "flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
          activeFilterCount > 0
            ? "border-primary bg-primary/5 text-primary"
            : "border-stroke-subtle text-text-default hover:bg-primary/5",
        )}
      >
        <Filter className="h-4 w-4" />
        Filter
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex w-80 flex-col overflow-hidden rounded-2xl bg-white px-6 shadow-xl">
          <div className="flex items-center justify-between pt-5">
            <span className="text-base font-medium text-text-default">
              Filters
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-text-subtle transition-colors hover:text-text-default"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-5 py-5">
            {availableFloors.length > 0 && (
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-text-default">Floor</h3>
                <div className="flex flex-wrap gap-2">
                  {availableFloors.map((floor) => (
                    <FilterChip
                      key={floor}
                      label={`Floor ${floor}`}
                      selected={pendingFloor === String(floor)}
                      onClick={() =>
                        setPendingFloor(
                          pendingFloor === String(floor)
                            ? "all"
                            : String(floor),
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {availableGroupSizes.length > 0 && (
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-text-default">
                  Group Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableGroupSizes.map((size) => (
                    <FilterChip
                      key={size}
                      label={String(size)}
                      selected={pendingGroupSize === String(size)}
                      onClick={() =>
                        setPendingGroupSize(
                          pendingGroupSize === String(size)
                            ? "all"
                            : String(size),
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="border-t border-stroke-subtle" />
          <div className="flex justify-end gap-3 py-4">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
