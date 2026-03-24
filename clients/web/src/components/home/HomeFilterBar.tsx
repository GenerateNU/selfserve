import { ChevronDown, LayoutGrid } from "lucide-react";

const FILTER_PILLS = [
  { label: "Grouping", value: "Departments" },
  { label: "Assignee", value: "All" },
  { label: "Priority", value: "All" },
  { label: "Location", value: "All" },
  { label: "Deadline", value: "All" },
];

export function HomeFilterBar() {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-stroke-subtle">
      <div className="flex items-center gap-2">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.label}
            type="button"
            className="flex items-center gap-1.5 bg-request-completed-secondary rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <LayoutGrid className="size-3" />
            <span>
              {pill.label}: <span className="font-semibold">{pill.value}</span>
            </span>
            <ChevronDown className="size-3" />
          </button>
        ))}
        <button
          type="button"
          className="text-xs font-medium text-text-subtle hover:text-text-default transition-colors px-2"
        >
          + Filter
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-sm text-text-subtle hover:text-text-default transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-lg border border-text-default px-4 py-1.5 text-sm font-medium text-text-default hover:bg-zinc-50 transition-colors"
        >
          Save as New View
        </button>
      </div>
    </div>
  );
}
