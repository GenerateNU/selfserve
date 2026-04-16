import { useState } from "react";
import type { RefObject } from "react";
import { FilterChip } from "@/components/rooms/FilterChip";
import { Button } from "@/components/ui/Button";
import { useClickOutside } from "@/hooks/use-click-outside";

const STATUS_CHIPS = ["All", "Unread"] as const;
const DATE_CHIPS = ["Standard", "Deluxe", "Suite", "Accessible"] as const;

type FilterPopoverProps = {
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
};

export function FilterPopover({ onClose, containerRef }: FilterPopoverProps) {
  useClickOutside(containerRef, onClose);

  const [activeStatus, setActiveStatus] = useState("All");
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());

  function toggleDate(chip: string) {
    setActiveDates((prev) => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  }

  function handleReset() {
    setActiveStatus("All");
    setActiveDates(new Set());
  }

  return (
    <div className="absolute right-0 top-8 z-10 w-80 rounded-xl bg-bg-primary shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-text-default">
            All Filters
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-text-subtle hover:text-text-default"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((chip) => (
            <FilterChip
              key={chip}
              label={chip}
              isSelected={activeStatus === chip}
              onToggle={() => setActiveStatus(chip)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-text-subtle">Date</span>
          <div className="flex flex-wrap gap-2">
            {DATE_CHIPS.map((chip) => (
              <FilterChip
                key={chip}
                label={chip}
                isSelected={activeDates.has(chip)}
                onToggle={() => toggleDate(chip)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-stroke-subtle px-5 py-5">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={onClose} className="flex-1">
          Select
        </Button>
      </div>
    </div>
  );
}
