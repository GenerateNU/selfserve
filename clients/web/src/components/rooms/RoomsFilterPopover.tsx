import { useState } from "react";
import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterSection } from "@/components/rooms/FilterSection";

const STATUS_CHIPS = [
  "Occupied",
  "Vacant",
  "Reserved",
  "Out of Order",
  "Needs Cleaning",
  "Open Requests",
];
const ATTRIBUTE_CHIPS = ["Standard", "Deluxe", "Suite", "Accessible"];
const ADVANCED_CHIPS = [
  "Arrivals Today",
  "Departures Today",
  "Late Checkouts",
  "Early Check-ins",
];

const INITIAL_SELECTED = new Set<string>(["Occupied", "Open Requests"]);

function FilterPopoverHeader({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex items-center justify-between pt-5">
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
    <>
      <div className="border-t border-stroke-subtle" />
      <div className="flex gap-3 py-5 justify-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-base rounded-sm text-text-default bg-bg-container hover:bg-primary/5 transition-colors h-10 w-47 text-center"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="text-sm font-base rounded-sm text-white bg-primary hover:bg-primary/90 transition-colors h-10 w-47 text-center"
        >
          Select
        </button>
      </div>
    </>
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
  };

  const handleReset = () => {
    setPendingChips(new Set());
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) setPendingChips(new Set(selectedChips));
        setOpen(next);
      }}
    >
      <PopoverTrigger>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-stroke-subtle px-4 py-2 text-sm font-medium text-text-default hover:bg-primary/5 transition-colors h-11 w-22.75"
        >
          <Filter className="h-4 w-4 text-text-default" />
          Filter
        </button>
      </PopoverTrigger>
      <PopoverContent sideOffset={8} align="start" className="px-6 w-115.75">
        <FilterPopoverHeader onReset={handleReset} />

        <div className="flex flex-col gap-5 pt-3 pb-5">
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

        <FilterPopoverFooter onCancel={handleCancel} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
