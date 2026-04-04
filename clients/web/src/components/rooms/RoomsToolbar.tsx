import { FloorDropdown } from "./FloorDropdown";
import { OrderByDropdown } from "./OrderByDropdown";
import { RoomsFilterPopover } from "@/components/rooms/RoomsFilterPopover";

type RoomsToolbarProps = {
  selectedFloors: Array<number>;
  onChangeSelectedFloors: (floors: Array<number>) => void;
  ascending: boolean;
  setAscending: (ascending: boolean) => void;
};

export function RoomsToolbar({
  selectedFloors,
  onChangeSelectedFloors,
  ascending,
  setAscending,
}: RoomsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <FloorDropdown
        selected={selectedFloors}
        onChangeSelectedFloors={onChangeSelectedFloors}
      />
      <RoomsFilterPopover />
      <OrderByDropdown ascending={ascending} setAscending={setAscending} />
    </div>
  );
}
