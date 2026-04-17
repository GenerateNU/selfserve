import { SearchBar } from "../ui/SearchBar";
import { FloorDropdown } from "./FloorDropdown";
import { OrderByDropdown } from "./OrderByDropdown";
import type { RoomSortOption } from "./OrderByDropdown";
import type { RoomFilters, RoomsPageFilters } from "@/hooks/use-rooms-filters";
import type {
  RoomAdvancedFilter,
  RoomAttributeFilter,
  RoomStatusFilter,
} from "@shared/api/rooms";
import { FilterTag } from "@/components/rooms/FilterTag";
import {
  ADVANCED_OPTIONS,
  ATTRIBUTE_OPTIONS,
  RoomsFilterPopover,
  STATUS_OPTIONS,
} from "@/components/rooms/RoomsFilterPopover";

export type { RoomsPageFilters };

type RoomsToolbarProps = {
  searchTerm: string;
  onChangeSearchTerm: (value: string) => void;
  filters: RoomsPageFilters;
  onChangeFloors: (floors: Array<number>) => void;
  onApplyFilters: (filters: RoomFilters) => void;
  onRemoveStatus: (value: RoomStatusFilter) => void;
  onRemoveAttribute: (value: RoomAttributeFilter) => void;
  onRemoveAdvanced: (value: RoomAdvancedFilter) => void;
  sortOption: RoomSortOption;
  setSortOption: (option: RoomSortOption) => void;
};

export function RoomsToolbar({
  searchTerm,
  onChangeSearchTerm,
  filters,
  onChangeFloors,
  onApplyFilters,
  onRemoveStatus,
  onRemoveAttribute,
  onRemoveAdvanced,
  sortOption,
  setSortOption,
}: RoomsToolbarProps) {
  const hasActiveFilterTags =
    filters.floors.length > 0 ||
    filters.status.length > 0 ||
    filters.attributes.length > 0 ||
    filters.advanced.length > 0;

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
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
            filters={{
              status: filters.status,
              attributes: filters.attributes,
              advanced: filters.advanced,
            }}
            onApply={onApplyFilters}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-sm text-text-subtle">
            Sort by:
          </span>
          <OrderByDropdown
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
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
          {filters.status.map((value) => {
            const label =
              STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
            return (
              <FilterTag
                key={`status-${value}`}
                label={label}
                onRemove={() => onRemoveStatus(value)}
              />
            );
          })}
          {filters.attributes.map((value) => {
            const label =
              ATTRIBUTE_OPTIONS.find((o) => o.value === value)?.label ?? value;
            return (
              <FilterTag
                key={`attribute-${value}`}
                label={label}
                onRemove={() => onRemoveAttribute(value)}
              />
            );
          })}
          {filters.advanced.map((value) => {
            const label =
              ADVANCED_OPTIONS.find((o) => o.value === value)?.label ?? value;
            return (
              <FilterTag
                key={`advanced-${value}`}
                label={label}
                onRemove={() => onRemoveAdvanced(value)}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-3" />
      )}
    </div>
  );
}
