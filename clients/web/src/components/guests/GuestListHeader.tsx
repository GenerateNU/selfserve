import { GuestFilterPopover } from "./GuestFilterPopover";
import { GuestSearchBar } from "./GuestSearchBar";

type GuestListHeaderProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFloors: Array<number>;
  selectedGroupSizes: Array<string>;
  onApplyFilters: (floors: Array<number>, groupSizes: Array<string>) => void;
};

export function GuestListHeader({
  searchTerm,
  onSearchChange,
  selectedFloors,
  selectedGroupSizes,
  onApplyFilters,
}: GuestListHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-6">
      <div className="min-w-0 flex-1">
        <GuestSearchBar value={searchTerm} onChange={onSearchChange} />
      </div>
      <GuestFilterPopover
        selectedFloors={selectedFloors}
        selectedGroupSizes={selectedGroupSizes}
        onApply={onApplyFilters}
      />
    </div>
  );
}
