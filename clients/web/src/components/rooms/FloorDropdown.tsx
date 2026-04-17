import { ChevronDown } from "lucide-react";
import { useGetRoomsFloors } from "@shared";
import { Button } from "../ui/Button";
import { useDropdown } from "../../hooks/use-dropdown";
import { FloorDropdownOptions } from "./FloorDropdownOptions";
import { FloorDropdownSearch } from "./FloorDropdownSearch";

type FloorDropdownProps = {
  selected?: Array<number>;
  onChangeSelectedFloors?: (floors: Array<number>) => void;
};

function getFloorLabel(selected: Array<number>) {
  switch (selected.length) {
    case 0:
      return "All Floors";
    case 1:
      return `Floor ${selected[0]}`;
    default:
      return `${selected.length} floors selected`;
  }
}

export function FloorDropdown({
  selected = [],
  onChangeSelectedFloors,
}: FloorDropdownProps) {
  const { data: floors } = useGetRoomsFloors();
  const floorList = floors ?? [];

  const {
    open,
    search,
    pending,
    searchProps,
    triggerProps,
    toggle,
    selectProps,
    cancelProps,
  } = useDropdown<number>({
    selected,
    onChangeSelectedItems: onChangeSelectedFloors,
  });

  const filtered = floorList.filter((f) =>
    `floor ${f}`.includes(search.trim().toLowerCase()),
  );

  return (
    <div className="relative min-w-0 w-full max-w-56.25 bg-bg-primary rounded-md border border-stroke-subtle">
      <button
        type="button"
        {...triggerProps}
        className={`flex w-full min-w-0 items-center justify-between text-sm text-text-default px-4 py-2 ${open ? "rounded-t-md" : "rounded-md"}`}
      >
        <span className="text-sm truncate">{getFloorLabel(selected)}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 w-full bg-bg-primary rounded-b-md shadow-md">
          <FloorDropdownSearch {...searchProps} />

          <FloorDropdownOptions
            floors={filtered}
            pending={pending}
            search={search}
            onToggle={toggle}
          />

          <div className="flex justify-end gap-3 border-t border-stroke-subtle p-3">
            <Button variant="secondary" {...cancelProps}>
              Cancel
            </Button>
            <Button variant="primary" {...selectProps}>
              Select
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
