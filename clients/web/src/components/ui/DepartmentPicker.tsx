import { useState } from "react";
import { useGetDepartments } from "@shared/api/departments";
import type { Department } from "@shared";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DepartmentPickerProps = {
  hotelId: string;
  selectedDepartment?: Department;
  onSelect: (department: Department | undefined) => void;
};

export function DepartmentPicker({
  hotelId,
  selectedDepartment,
  onSelect,
}: DepartmentPickerProps) {
  const [open, setOpen] = useState(false);

  const { data: departments = [], isLoading } = useGetDepartments(hotelId);

  function handleSelect(department: Department) {
    if (selectedDepartment?.id === department.id) {
      onSelect(undefined);
    } else {
      onSelect(department);
    }
    setOpen(false);
  }

  const triggerLabel = selectedDepartment?.name ?? "No department";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-bg-selected",
          selectedDepartment ? "text-text-default" : "text-text-subtle",
        )}
      >
        {triggerLabel}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-56 p-0"
      >
        <div className="flex max-h-60 flex-col overflow-y-auto">
          {isLoading && (
            <p className="px-3 py-4 text-center text-sm text-text-subtle">
              Loading...
            </p>
          )}
          {!isLoading && departments.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-text-subtle">
              No departments found
            </p>
          )}
          {departments.map((department) => (
            <button
              key={department.id}
              type="button"
              onClick={() => handleSelect(department)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-bg-selected",
                selectedDepartment?.id === department.id && "bg-bg-selected",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text-default">
                  {department.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
