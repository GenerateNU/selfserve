import { GuestFilterPopover } from "./GuestFilterPopover";
import { GuestSearchBar } from "./GuestSearchBar";

type GuestListHeaderProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableFloors: Array<number>;
  availableGroupSizes: Array<number>;
  selectedFloors: Array<number>;
  selectedGroupSizes: Array<number>;
  onApplyFilters: (floors: Array<number>, groupSizes: Array<number>) => void;
};

export function GuestListHeader({
  searchTerm,
  onSearchChange,
  availableFloors,
  availableGroupSizes,
  selectedFloors,
  selectedGroupSizes,
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
        selectedFloors={selectedFloors}
        selectedGroupSizes={selectedGroupSizes}
        onApply={onApplyFilters}
      />
    </div>
  );
}
