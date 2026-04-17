import { SearchBar } from "../ui/SearchBar";
import { FloorDropdown } from "./FloorDropdown";
import { OrderByDropdown } from "./OrderByDropdown";
import type { RoomsPageFilters } from "@/hooks/use-rooms-filters";
import { FilterTag } from "@/components/rooms/FilterTag";
import { RoomsFilterPopover } from "@/components/rooms/RoomsFilterPopover";

export type { RoomsPageFilters };

type RoomsToolbarProps = {
  searchTerm: string;
  onChangeSearchTerm: (value: string) => void;
  filters: RoomsPageFilters;
  onChangeFloors: (floors: Array<number>) => void;
  onRemoveFilterChip: (chip: string) => void;
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
  onRemoveFilterChip,
  ascending,
  setAscending,
}: RoomsToolbarProps) {
  const hasActiveFilterTags =
    filters.floors.length > 0 || filters.filterChips.length > 0;

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={searchTerm}
          onChange={onChangeSearchTerm}
          placeholder="Search for a room..."
          className="w-56.25"
        />
        <FloorDropdown
          selected={filters.floors}
          onChangeSelectedFloors={onChangeFloors}
        />
        <RoomsFilterPopover
          appliedChips={filters.filterChips}
          onApplyChips={onApplyFilterChips}
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-text-subtle">
            Sort by:
          </span>
          <OrderByDropdown ascending={ascending} setAscending={setAscending} />
        </div>
      </div>
      {hasActiveFilterTags ? (
        <div className="flex flex-wrap gap-2 py-3">
          {filters.floors.map((floor) => (
            <FilterTag
              key={`floor-${floor}`}
              label={`Floor ${floor}`}
              onRemove={() =>
                onChangeFloors(
                  filters.floors.filter((value) => value !== floor),
                )
              }
            />
          ))}
          {filters.filterChips.map((chip) => (
            <FilterTag
              key={chip}
              label={chip}
              onRemove={() => onRemoveFilterChip(chip)}
            />
          ))}
        </div>
      ) : (
        <div className="h-3" />
      )}
    </div>
  );
}
