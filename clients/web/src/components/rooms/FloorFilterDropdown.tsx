import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FLOOR_OPTIONS = [1, 2, 3, 4, 5];

type FloorFilterDropdownProps = {
  selected: Array<number>;
  onChange: (selected: Array<number>) => void;
};

function getLabel(selected: Array<number>): string {
  if (selected.length === 0) return "All floors";
  if (selected.length === 1) return `Floor ${selected[0]}`;
  return "Multiple floors";
}

export function FloorFilterDropdown({
  selected,
  onChange,
}: FloorFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggle = (floor: number) => {
    onChange(
      selected.includes(floor)
        ? selected.filter((f) => f !== floor)
        : [...selected, floor],
    );
  };

  return (
    <div
      className="relative inline-block"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-75 h-11 items-center justify-between rounded-md border border-stroke-subtle bg-white px-3 py-2 text-sm font-medium text-text-default transition-colors hover:bg-gray-50"
      >
        <span>{getLabel(selected)}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          tabIndex={-1}
        >
          {FLOOR_OPTIONS.map((floor) => (
            <label
              key={floor}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-text-default hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(floor)}
                onChange={() => toggle(floor)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Floor {floor}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
