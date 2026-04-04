import { SearchBar } from "../ui/SearchBar";
import { FloorDropdown } from "./FloorDropdown";
import { OrderByDropdown } from "./OrderByDropdown";
import { RoomsFilterPopover } from "@/components/rooms/RoomsFilterPopover";

type RoomsToolbarProps = {
  searchTerm: string;
  onChangeSearchTerm: (value: string) => void;
  selectedFloors: Array<number>;
  onChangeSelectedFloors: (floors: Array<number>) => void;
  ascending: boolean;
  setAscending: (ascending: boolean) => void;
};

export function RoomsToolbar({
  searchTerm,
  onChangeSearchTerm,
  selectedFloors,
  onChangeSelectedFloors,
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
        selected={selectedFloors}
        onChangeSelectedFloors={onChangeSelectedFloors}
      />
      <RoomsFilterPopover />
      <OrderByDropdown ascending={ascending} setAscending={setAscending} />
    </div>
  );
}
