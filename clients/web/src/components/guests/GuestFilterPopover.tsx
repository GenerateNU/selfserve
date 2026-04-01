import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const FLOOR_OPTIONS = [1, 2, 3, 4, 5];
const GROUP_SIZE_OPTIONS = ["1-2", "3-4", "5+"];

type GuestFilterPopoverProps = {
  selectedFloors: Array<number>;
  selectedGroupSizes: Array<string>;
  onApply: (floors: Array<number>, groupSizes: Array<string>) => void;
};

export function selectSingleFilterValue<T>(items: Array<T>, item: T) {
  return items.includes(item) ? [] : [item];
}

function FilterButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-4 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-stroke-subtle bg-white text-text-default hover:border-primary",
      )}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-text-default">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export function GuestFilterPopover({
  selectedFloors,
  selectedGroupSizes,
  onApply,
}: GuestFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pendingFloors, setPendingFloors] = useState(selectedFloors);
  const [pendingGroupSizes, setPendingGroupSizes] =
    useState(selectedGroupSizes);

  const handleOpen = () => {
    setPendingFloors(selectedFloors);
    setPendingGroupSizes(selectedGroupSizes);
    setOpen(true);
  };

  const handleCancel = () => {
    setPendingFloors(selectedFloors);
    setPendingGroupSizes(selectedGroupSizes);
    setOpen(false);
  };

  const handleSelect = () => {
    onApply(pendingFloors, pendingGroupSizes);
    setOpen(false);
  };

  const handleReset = () => {
    setPendingFloors([]);
    setPendingGroupSizes([]);
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={open ? handleCancel : handleOpen}
        className="flex h-11 items-center gap-2 rounded-lg border border-stroke-subtle px-4 text-sm font-medium text-text-default transition-colors hover:bg-primary/5"
      >
        <Filter className="h-4 w-4" />
        Filter
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex w-[32rem] flex-col overflow-hidden rounded-2xl bg-white px-6 shadow-xl">
          <div className="flex items-center justify-between pt-5">
            <span className="text-base font-medium text-text-default">
              All Filters
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-text-subtle transition-colors hover:text-text-default"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-5 py-5">
            <Section title="Floor">
              {FLOOR_OPTIONS.map((floor) => (
                <FilterButton
                  key={floor}
                  label={`Floor ${floor}`}
                  selected={pendingFloors.includes(floor)}
                  onClick={() =>
                    setPendingFloors((current) =>
                      selectSingleFilterValue(current, floor),
                    )
                  }
                />
              ))}
            </Section>

            <Section title="Group Size">
              {GROUP_SIZE_OPTIONS.map((groupSize) => (
                <FilterButton
                  key={groupSize}
                  label={groupSize}
                  selected={pendingGroupSizes.includes(groupSize)}
                  onClick={() =>
                    setPendingGroupSizes((current) =>
                      selectSingleFilterValue(current, groupSize),
                    )
                  }
                />
              ))}
            </Section>
          </div>

          <div className="border-t border-stroke-subtle" />
          <div className="flex justify-end gap-3 py-5">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSelect}>
              Select
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
