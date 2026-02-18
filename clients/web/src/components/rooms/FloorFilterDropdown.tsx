import { useEffect, useRef, useState  } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (floor: number) => {
    onChange(
      selected.includes(floor)
        ? selected.filter((f) => f !== floor)
        : [...selected, floor],
    );
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-40 items-center justify-between rounded-md bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/30"
      >
        <span>{getLabel(selected)}</span>

        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}/>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {FLOOR_OPTIONS.map((floor) => (
            <label
              key={floor}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(floor)}
                onChange={() => toggle(floor)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Floor {floor}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
