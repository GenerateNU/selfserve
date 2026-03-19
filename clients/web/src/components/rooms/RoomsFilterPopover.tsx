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
          className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </PopoverTrigger>
      <PopoverContent sideOffset={8} align="start">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <span className="text-lg font-bold text-gray-900">All Filters</span>
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 pb-6">
          <FilterSection title="Status" chips={STATUS_CHIPS} selectedChips={SELECTED_CHIPS} />
          <FilterSection title="Room Attributes" chips={ATTRIBUTE_CHIPS} selectedChips={SELECTED_CHIPS} />
          <FilterSection title="Advanced" chips={ADVANCED_CHIPS} selectedChips={SELECTED_CHIPS} />
        </div>

        <div className="border-t border-gray-200 flex">
          <button
            type="button"
            className="flex-1 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-4 text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Select
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
