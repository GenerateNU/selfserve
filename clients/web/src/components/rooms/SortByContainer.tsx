import { OrderByDropdown } from "./OrderByDropdown";
import type { RoomSortOption } from "./OrderByDropdown";

type SortByContainerProps = {
  sortOption: RoomSortOption;
  setSortOption: (option: RoomSortOption) => void;
};

export function SortByContainer({
  sortOption,
  setSortOption,
}: SortByContainerProps) {
  return (
    <span className="text-sm text-text-subtle flex items-center gap-1 pt-6">
      Sort by:{" "}
      <OrderByDropdown sortOption={sortOption} setSortOption={setSortOption} />
    </span>
  );
}
