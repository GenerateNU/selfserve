import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type OrderByDropdownProps = {
  ascending: boolean;
  setAscending: (ascending: boolean) => void;
};

export function OrderByDropdown({
  ascending,
  setAscending,
}: OrderByDropdownProps) {
  const [open, setOpen] = useState(false);
  const label = ascending ? "Ascending" : "Descending";

  return (
    <div
      className="relative min-w-0 w-full max-w-31.5"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between gap-2 py-1 pl-2 pr-1 border border-stroke-subtle bg-bg-primary text-left",
          open ? "rounded-t-md" : "rounded-md",
        )}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="min-w-0 truncate text-md text-text-default">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 w-full rounded-b-md border border-t-0 border-stroke-subtle bg-bg-primary shadow-md">
          <button
            type="button"
            className="block w-full pl-2 pr-1 py-1 text-left text-md text-text-default hover:bg-bg-selected"
            onClick={() => {
              setAscending(!ascending);
              setOpen(false);
            }}
          >
            {ascending ? "Descending" : "Ascending"}
          </button>
        </div>
      )}
    </div>
  );
}
