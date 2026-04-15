import { ChevronDown, LayoutGrid, User } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { RequestFeedSort } from "@shared/api/requests";
import { FilterSortMenu } from "./FilterSortMenu";

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Priority", value: "priority" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

type HomeFilterBarProps = {
  sort?: RequestFeedSort;
  onSortChange?: (sort: RequestFeedSort | undefined) => void;
};

const SORT_LABELS: Record<RequestFeedSort, string> = {
  priority: "Priority",
  newest: "Newest",
  oldest: "Oldest",
};

type FilterChipProps = {
  label: string;
  active?: boolean;
  activeValue?: string;
  icon?: "grid" | "user";
  onClick?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

function FilterChip({
  label,
  active,
  activeValue,
  icon = "grid",
  onClick,
  ref,
}: FilterChipProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-[#edf5f1] border-primary text-primary"
          : "bg-white border-stroke-default text-text-secondary hover:bg-bg-container",
      )}
    >
      {icon === "user" ? (
        <User className="size-[13px]" />
      ) : (
        <LayoutGrid className="size-[13px]" />
      )}
      <span>
        {active && activeValue ? (
          <>
            {label}: <span className="font-bold">{activeValue}</span>
          </>
        ) : (
          label
        )}
      </span>
      <ChevronDown className="size-[11px]" />
    </button>
  );
}

export function HomeFilterBar({ sort, onSortChange }: HomeFilterBarProps) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  function openSortMenu() {
    if (sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setMenuAnchor({ x: rect.left, y: rect.bottom + 6 });
    }
    setSortMenuOpen(true);
  }

  const activeSortLabel = sort ? SORT_LABELS[sort] : undefined;

  return (
    <>
      <div className="flex items-center justify-between px-6 py-2 border-b border-stroke-subtle">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <FilterChip
              ref={sortButtonRef}
              label="Sorting"
              active={!!activeSortLabel}
              activeValue={activeSortLabel}
              onClick={openSortMenu}
            />
            <FilterChip label="Grouping" />
          </div>
          <div className="flex items-center gap-3">
            <FilterChip
              label="Assignee"
              active
              activeValue="Rohan K"
              icon="user"
            />
            <FilterChip label="Priority" />
            <FilterChip label="Location" />
            <FilterChip label="Deadline" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-sm text-text-secondary hover:text-text-default transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            className="rounded border border-stroke-default px-2 py-1 text-sm text-text-secondary hover:bg-bg-container transition-colors"
          >
            Save as New View
          </button>
        </div>
      </div>

      {sortMenuOpen && (
        <FilterSortMenu
          options={SORT_OPTIONS}
          selected={sort}
          anchor={menuAnchor}
          onApply={(value) =>
            onSortChange?.(value as RequestFeedSort | undefined)
          }
          onClose={() => setSortMenuOpen(false)}
        />
      )}
    </>
  );
}
