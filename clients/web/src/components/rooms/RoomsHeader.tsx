import { PanelRight } from "lucide-react";
import { FloorDropdown } from "@/components/rooms/FloorDropdown";

type RoomsHeaderProps = {
  onOpenDrawer?: () => void;
  selectedFloors: Array<number>;
  onChangeSelectedFloors: (floors: Array<number>) => void;
};

export function RoomsHeader({
  onOpenDrawer,
  selectedFloors,
  onChangeSelectedFloors,
}: RoomsHeaderProps) {
  return (
    <header className="flex h-full w-full min-w-0 items-center justify-between">
      <FloorDropdown
        selected={selectedFloors}
        onChangeSelectedFloors={onChangeSelectedFloors}
      />
      <button
        type="button"
        onClick={onOpenDrawer}
        className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
      >
        <PanelRight className="h-5 w-5" />
      </button>
    </header>
  );
}
