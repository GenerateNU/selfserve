import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type RoomSortOption = "ascending" | "descending" | "urgency";

type OrderByDropdownProps = {
  sortOption: RoomSortOption;
  setSortOption: (option: RoomSortOption) => void;
};

const OPTIONS: Array<{ label: string; value: RoomSortOption }> = [
  { label: "Ascending", value: "ascending" },
  { label: "Descending", value: "descending" },
  { label: "Urgency", value: "urgency" },
];

export function OrderByDropdown({
  sortOption,
  setSortOption,
}: OrderByDropdownProps) {
  const [open, setOpen] = useState(false);
  const currentLabel =
    OPTIONS.find((o) => o.value === sortOption)?.label ?? "Ascending";

  return (
    <div
      className="relative w-30.5"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between pl-3 pr-2 py-2 text-left bg-bg-primary border border-stroke-subtle",
          open ? "rounded-t border-b-stroke-disabled" : "rounded",
        )}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="truncate text-base text-text-default">
          {currentLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 flex w-full flex-col gap-1 rounded-b border border-t-0 border-stroke-subtle bg-bg-primary p-1 shadow-sm">
          {OPTIONS.map((option) => {
            const isSelected = option.value === sortOption;
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex items-center rounded px-3 py-1 text-left text-base text-text-default",
                  isSelected ? "bg-bg-selected" : "hover:bg-bg-container",
                )}
                onClick={() => {
                  setSortOption(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
