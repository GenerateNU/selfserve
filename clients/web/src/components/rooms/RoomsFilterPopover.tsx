import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterSection } from "@/components/rooms/FilterSection";
import { FilterIcon } from "@/icons/filter";
import { cn } from "@/lib/utils";

const STATUS_CHIPS = [
  "Occupied",
  "Vacant",
  "Reserved",
  "Out of Order",
  "Needs Cleaning",
  "Open Tasks",
];
const ATTRIBUTE_CHIPS = ["Standard", "Deluxe", "Suite", "Accessible"];
const ADVANCED_CHIPS = [
  "Arrivals Today",
  "Departures Today",
  "Late Checkouts",
  "Early Check-ins",
];

const INITIAL_SELECTED = new Set<string>(["Occupied", "Open Tasks"]);

function FilterPopoverHeader({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base font-medium text-text-default">
        All Filters
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-text-subtle hover:text-text-default transition-colors"
      >
        Reset
      </button>
    </div>
  );
}

function FilterPopoverFooter({
  onCancel,
  onSelect,
}: {
  onCancel: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="flex gap-3 px-3 py-5 border-t border-stroke-subtle">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-10 rounded text-sm text-primary bg-white hover:bg-primary/5 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 h-10 rounded text-sm text-white bg-primary hover:bg-primary-hover transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}

export function RoomsFilterPopover() {
  const [open, setOpen] = useState(false);
  const [selectedChips, setSelectedChips] =
    useState<Set<string>>(INITIAL_SELECTED);
  const [pendingChips, setPendingChips] =
    useState<Set<string>>(INITIAL_SELECTED);

  const toggle = (chip: string) => {
    setPendingChips((prev) => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  };

  const handleSelect = () => {
    setSelectedChips(new Set(pendingChips));
    setOpen(false);
  };

  const handleCancel = () => {
    setPendingChips(new Set(selectedChips));
    setOpen(false);
  };

  const handleReset = () => {
    setPendingChips(new Set());
  };

  const appliedCount = selectedChips.size;
  const filtersActive = appliedCount > 0;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) setPendingChips(new Set(selectedChips));
        setOpen(next);
      }}
    >
      <PopoverTrigger
        className={cn(
          "flex items-center gap-2 rounded border border-primary px-3 py-2 text-base tracking-[-0.01em] transition-colors shrink-0",
          filtersActive ? "w-30" : "w-21",
          filtersActive
            ? "bg-primary text-white hover:bg-primary-hover"
            : "bg-white text-primary hover:bg-primary/5",
        )}
        aria-label={
          filtersActive
            ? `Filter, ${appliedCount} applied`
            : "Open room filters"
        }
      >
        <FilterIcon
          className={cn(
            "size-[18px] shrink-0",
            filtersActive ? "text-white" : "text-primary",
          )}
        />
        {filtersActive ? `Filter (${appliedCount})` : "Filter"}
      </PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        align="start"
        className="rounded-lg shadow-md w-115.75"
      >
        <div className="flex flex-col gap-3 px-6 py-5">
          <FilterPopoverHeader onReset={handleReset} />

          <div className="flex flex-col gap-5">
            <FilterSection
              title="Status"
              chips={STATUS_CHIPS}
              selectedChips={pendingChips}
              onToggle={toggle}
            />
            <FilterSection
              title="Room Attributes"
              chips={ATTRIBUTE_CHIPS}
              selectedChips={pendingChips}
              onToggle={toggle}
            />
            <FilterSection
              title="Advanced"
              chips={ADVANCED_CHIPS}
              selectedChips={pendingChips}
              onToggle={toggle}
            />
          </div>
        </div>

        <FilterPopoverFooter onCancel={handleCancel} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
