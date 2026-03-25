type FloorDropdownOptionsProps = {
  floors: Array<number>;
  pending: Array<number>;
  search: string;
  onToggle: (floor: number) => void;
};

export function FloorDropdownOptions({
  floors,
  pending,
  search,
  onToggle,
}: FloorDropdownOptionsProps) {
  return (
    <div className="flex flex-col max-h-28 overflow-y-auto">
      {floors.length === 0 ? (
        <p className="px-4 py-2 text-sm text-text-subtle">
          No floors match "{search}"
        </p>
      ) : (
        floors.map((floor) => (
          <label
            key={floor}
            className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-bg-selected"
          >
            <input
              type="checkbox"
              checked={pending.includes(floor)}
              onChange={() => onToggle(floor)}
              className="accent-black"
            />
            Floor {floor}
          </label>
        ))
      )}
    </div>
  );
}
