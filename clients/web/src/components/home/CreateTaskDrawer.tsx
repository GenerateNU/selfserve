import { useState } from "react";
import { ChevronDown, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrawerShell } from "@/components/ui/DrawerShell";

type ActivityTab = "all" | "comments" | "history";

const ACTIVITY_TABS: { key: ActivityTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "comments", label: "Comments" },
  { key: "history", label: "History" },
];

type FieldRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function FieldRow({ label, value, valueClassName }: FieldRowProps) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex w-28 shrink-0 items-center gap-1">
        <GripHorizontal className="size-[18px] text-text-subtle" />
        <span className="text-sm text-text-subtle">{label}</span>
      </div>
      <span className={cn("text-sm text-text-default", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

type CreateTaskDrawerProps = {
  onClose: () => void;
};

export function CreateTaskDrawer({ onClose }: CreateTaskDrawerProps) {
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");

  return (
    <DrawerShell title="New Task" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldRow
          label="Assignee"
          value="Assign Someone"
          valueClassName="text-primary"
        />
        <FieldRow label="Deadline" value="Empty" />
        <FieldRow label="Priority" value="Empty" />
        <FieldRow label="Department" value="Empty" />
        <FieldRow label="Location" value="Empty" />

        {showMore && (
          <>
            <FieldRow label="Room" value="Empty" />
            <FieldRow label="Tags" value="Empty" />
          </>
        )}

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex items-center gap-2 text-xs text-text-subtle transition-colors hover:text-text-default"
        >
          Show More
          <ChevronDown
            className={cn(
              "size-3 transition-transform",
              showMore && "rotate-180",
            )}
          />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-subtle">Description</span>
        <p className="text-sm text-text-subtle">Add a description...</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-text-default">Activity</span>
        <div className="flex items-end justify-between border-b border-stroke-subtle">
          {ACTIVITY_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-3 py-2 text-sm text-text-default transition-colors",
                activeTab === key
                  ? "border-b-2 border-text-default"
                  : "text-text-subtle hover:text-text-default",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </DrawerShell>
  );
}
