import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterSection } from "@/components/rooms/FilterSection";

const STATUS_CHIPS = ["Occupied", "Vacant", "Reserved", "Out of Order", "Needs Cleaning", "Open Tasks"];
const ATTRIBUTE_CHIPS = ["Standard", "Deluxe", "Suite", "Accessible"];
const ADVANCED_CHIPS = ["Arrivals Today", "Departures Today", "Late Checkouts", "Early Check-ins"];

const SELECTED_CHIPS = new Set(["Occupied", "Open Tasks"]);

export function RoomsFilterPopover() {
  return (
    <Popover>
      <PopoverTrigger>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-stroke-subtle px-4 py-2 text-sm font-medium text-text-default hover:bg-primary/5 transition-colors h-11 w-22.75"
        >
          <Filter className="h-4 w-4 color-text-default" />
          Filter
        </button>
      </PopoverTrigger>
      <PopoverContent sideOffset={8} align="start" className="px-6 w-115.75">
        <div className="flex items-center justify-between pt-5">
          <span className="text-base font-medium text-text-default">All Filters</span>
          <button
            type="button"
            className="text-sm text-text-subtle hover:text-text-default transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-col gap-5 pt-3 pb-5">
          <FilterSection title="Status" chips={STATUS_CHIPS} selectedChips={SELECTED_CHIPS} />
          <FilterSection title="Room Attributes" chips={ATTRIBUTE_CHIPS} selectedChips={SELECTED_CHIPS} />
          <FilterSection title="Advanced" chips={ADVANCED_CHIPS} selectedChips={SELECTED_CHIPS} />
        </div>

        <div className="border-t border-stroke-subtle" />

        <div className="flex gap-3 py-5 justify-center">
          <button
            type="button"
            className="text-sm font-base rounded-sm text-text-default bg-bg-container hover:bg-primary/5 transition-colors h-10 w-47 text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            className="text-sm font-base rounded-sm text-white bg-primary hover:bg-primary/90 transition-colors h-10 w-47 text-center"
          >
            Select
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
