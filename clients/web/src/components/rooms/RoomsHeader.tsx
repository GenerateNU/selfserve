import { FloorDropdown } from "./FloorDropdown";
import { RoomsFilterPopover } from "@/components/rooms/RoomsFilterPopover";

type RoomsHeaderProps = {
  selectedFloors: Array<number>;
  onChangeSelectedFloors: (floors: Array<number>) => void;
};

export function RoomsHeader({
  selectedFloors,
  onChangeSelectedFloors,
}: RoomsHeaderProps) {
  return (
    <header className="z-30 bg-bg-container px-16 py-6 flex items-center gap-3">
      <FloorDropdown
        selected={selectedFloors}
        onChangeSelectedFloors={onChangeSelectedFloors}
      />
      <RoomsFilterPopover />
    </header>
  );
}
