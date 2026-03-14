import { ChevronDown } from "lucide-react";
import { useGetRoomsFloors } from "@shared";
import { Button } from "../ui/Button";
import { useDropdown } from "../../hooks/use-dropdown";
import { FloorList } from "./FloorsList";
import { FloorSearchInput } from "./FloorSearchInput";

type FloorDropdownProps = {
  selected?: Array<number>;
  onChangeSelectedFloors?: (floors: Array<number>) => void;
};

function getFloorLabel(selected: Array<number>) {
  switch (selected.length) {
    case 0:
      return "Select a Floor";
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
  const { data: floors = [] } = useGetRoomsFloors();

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

  const filtered = floors.filter((f) =>
    `floor ${f}`.includes(search.trim().toLowerCase()),
  );

  return (
    <div className="relative min-w-0 w-full max-w-[18vw]">
      <button
        type="button"
        {...triggerProps}
        className={`flex w-full min-w-0 items-center justify-between border border-gray-300 bg-white px-[1vw] py-[1vh] text-md ${open ? "rounded-t-md" : "rounded-md"}`}
      >
        <span className="truncate text-sm">{getFloorLabel(selected)}</span>
        <ChevronDown
          className={`h-[2.25vh] w-[2.25vh] shrink-0 transition-transform duration-200 text-black ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 w-full rounded-b-md border border-t-0 border-gray-300 bg-white shadow-md">
          <FloorSearchInput {...searchProps} />

          <FloorList
            floors={filtered}
            pending={pending}
            search={search}
            onToggle={toggle}
          />

          <div className="flex justify-end gap-[0.5vw] border-t border-gray-300 px-[0.5vw] py-[0.75vh]">
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
