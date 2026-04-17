import { SearchBar } from "../ui/SearchBar";
import { FloorDropdown } from "./FloorDropdown";
import { OrderByDropdown } from "./OrderByDropdown";
import { RoomsFilterPopover } from "@/components/rooms/RoomsFilterPopover";
import type { RoomsPageFilters } from "@/hooks/use-rooms-filters";

export type { RoomsPageFilters };

type RoomsToolbarProps = {
  searchTerm: string;
  onChangeSearchTerm: (value: string) => void;
  filters: RoomsPageFilters;
  onChangeFloors: (floors: Array<number>) => void;
  onApplyFilterChips: (chips: Array<string>) => void;
  ascending: boolean;
  setAscending: (ascending: boolean) => void;
};

export function RoomsToolbar({
  searchTerm,
  onChangeSearchTerm,
  filters,
  onChangeFloors,
  onApplyFilterChips,
  ascending,
  setAscending,
}: RoomsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <SearchBar
        value={searchTerm}
        onChange={onChangeSearchTerm}
        placeholder="Search for a room..."
        className="w-full max-w-[16rem]"
      />
      <FloorDropdown
        selected={filters.floors}
        onChangeSelectedFloors={onChangeFloors}
      />
      <RoomsFilterPopover
        appliedChips={filters.filterChips}
        onApplyChips={onApplyFilterChips}
      />
      <OrderByDropdown ascending={ascending} setAscending={setAscending} />
    </div>
  );
}
