import { useState } from "react";
import type {
  RoomAdvancedFilter,
  RoomAttributeFilter,
  RoomStatusFilter,
} from "@shared/api/rooms";
import type { RoomFilters } from "@/hooks/use-rooms-filters";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterSection } from "@/components/rooms/FilterSection";
import { FilterIcon } from "@/icons/filter";
import { cn } from "@/lib/utils";

export const STATUS_OPTIONS: Array<{ value: RoomStatusFilter; label: string }> =
  [
    { value: "occupied", label: "Occupied" },
    { value: "vacant", label: "Vacant" },
    { value: "open-tasks", label: "Open Tasks" },
  ];

export const ATTRIBUTE_OPTIONS: Array<{
  value: RoomAttributeFilter;
  label: string;
}> = [
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "accessible", label: "Accessible" },
];

export const ADVANCED_OPTIONS: Array<{
  value: RoomAdvancedFilter;
  label: string;
}> = [
  { value: "arrivals-today", label: "Arrivals Today" },
  { value: "departures-today", label: "Departures Today" },
];

type RoomsFilterPopoverProps = {
  filters: RoomFilters;
  onApply: (filters: RoomFilters) => void;
};

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
  onApply,
}: {
  onCancel: () => void;
  onApply: () => void;
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
        onClick={onApply}
        className="flex-1 h-10 rounded text-sm text-white bg-primary hover:bg-primary-hover transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}

function toDraft(filters: RoomFilters) {
  return {
    status: new Set(filters.status),
    attributes: new Set(filters.attributes),
    advanced: new Set(filters.advanced),
  };
}

export function RoomsFilterPopover({
  filters,
  onApply,
}: RoomsFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => toDraft(filters));

  const toggleStatus = (value: RoomStatusFilter) => {
    setDraft((prev) => {
      const next = new Set(prev.status);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, status: next };
    });
  };

  const toggleAttribute = (value: RoomAttributeFilter) => {
    setDraft((prev) => {
      const next = new Set(prev.attributes);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, attributes: next };
    });
  };

  const toggleAdvanced = (value: RoomAdvancedFilter) => {
    setDraft((prev) => {
      const next = new Set(prev.advanced);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, advanced: next };
    });
  };

  const handleApply = () => {
    onApply({
      status: [...draft.status],
      attributes: [...draft.attributes],
      advanced: [...draft.advanced],
    });
    setOpen(false);
  };

  const handleCancel = () => {
    setDraft(toDraft(filters));
    setOpen(false);
  };

  const handleReset = () => {
    setDraft({ status: new Set(), attributes: new Set(), advanced: new Set() });
  };

  const appliedCount =
    filters.status.length + filters.attributes.length + filters.advanced.length;
  const filtersActive = appliedCount > 0;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDraft(toDraft(filters));
        }
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
        align="center"
        className="rounded-lg shadow-md w-115.75"
      >
        <div className="flex flex-col gap-3 px-6 py-5">
          <FilterPopoverHeader onReset={handleReset} />

          <div className="flex flex-col gap-5">
            <FilterSection
              title="Status"
              options={STATUS_OPTIONS}
              selectedValues={draft.status}
              onToggle={toggleStatus}
            />
            <FilterSection
              title="Room Attributes"
              options={ATTRIBUTE_OPTIONS}
              selectedValues={draft.attributes}
              onToggle={toggleAttribute}
            />
            <FilterSection
              title="Advanced"
              options={ADVANCED_OPTIONS}
              selectedValues={draft.advanced}
              onToggle={toggleAdvanced}
            />
          </div>
        </div>

        <FilterPopoverFooter onCancel={handleCancel} onApply={handleApply} />
      </PopoverContent>
    </Popover>
  );
}
