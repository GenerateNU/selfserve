import { Check, X } from "lucide-react";
import { useGetDepartments } from "@shared";
import { cn } from "@/lib/utils";

type DepartmentFilterMenuProps = {
  hotelId: string;
  selectedNames: Array<string>;
  anchor: { x: number; y: number };
  onApply: (names: Array<string>) => void;
  onClose: () => void;
};

export function DepartmentFilterMenu({
  hotelId,
  selectedNames,
  anchor,
  onApply,
  onClose,
}: DepartmentFilterMenuProps) {
  const { data: departments = [], isLoading } = useGetDepartments(hotelId);

  function toggle(name: string) {
    onApply(
      selectedNames.includes(name)
        ? selectedNames.filter((d) => d !== name)
        : [...selectedNames, name],
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-64 bg-white border border-stroke-subtle rounded-lg shadow-md overflow-hidden"
        style={{ left: anchor.x, top: anchor.y }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pl-4 pr-3 py-3 border-b border-stroke-subtle min-h-[48px]">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 bg-bg-container rounded px-2 py-1 text-sm text-text-default"
              >
                {name}
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  className="text-text-subtle hover:text-text-default"
                >
                  <X className="size-2" />
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onApply([])}
            className="shrink-0 text-sm text-text-subtle hover:text-text-default transition-colors ml-2"
          >
            Clear
          </button>
        </div>

        {/* Departments list */}
        <div className="max-h-52 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-3 text-sm text-text-subtle text-center">
              Loading...
            </p>
          )}
          {!isLoading && departments.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-subtle text-center">
              No departments found
            </p>
          )}
          {departments.map((dept) => {
            const isSelected = selectedNames.includes(dept.name);
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => toggle(dept.name)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2 text-sm text-text-default hover:bg-bg-container transition-colors",
                )}
              >
                <span
                  className={`shrink-0 size-4 rounded-sm border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-stroke-default bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="size-3 text-white" strokeWidth={3} />
                  )}
                </span>
                {dept.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
