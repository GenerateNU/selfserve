import { GuestFilterPopover } from "./GuestFilterPopover";
import { GuestSearchBar } from "./GuestSearchBar";

type GuestListHeaderProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableFloors: Array<number>;
  availableGroupSizes: Array<number>;
  selectedFloor: string;
  selectedGroupSize: string;
  onApplyFilters: (floor: string, groupSize: string) => void;
};

export function GuestListHeader({
  searchTerm,
  onSearchChange,
  availableFloors,
  availableGroupSizes,
  selectedFloor,
  selectedGroupSize,
  onApplyFilters,
}: GuestListHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <GuestSearchBar value={searchTerm} onChange={onSearchChange} />
      </div>
      <GuestFilterPopover
        availableFloors={availableFloors}
        availableGroupSizes={availableGroupSizes}
        selectedFloor={selectedFloor}
        selectedGroupSize={selectedGroupSize}
        onApply={onApplyFilters}
      />
    </div>
  );
}
