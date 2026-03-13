import { FloorDropdown } from "@/components/rooms/FloorDropdown";

type RoomsHeaderProps = {
  selectedFloors: Array<number>;
  onChangeSelectedFloors: (floors: Array<number>) => void;
};

export function RoomsHeader({
  selectedFloors,
  onChangeSelectedFloors,
}: RoomsHeaderProps) {
  return (
    <header className="flex h-full w-full min-w-0 items-center justify-between">
      <FloorDropdown
        selected={selectedFloors}
        onChangeSelectedFloors={onChangeSelectedFloors}
      />
    </header>
  );
}
