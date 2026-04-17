import { useState } from "react";
import { useGetDepartments } from "@shared";
import type { Department } from "@shared";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchBar } from "@/components/ui/SearchBar";
import { cn } from "@/lib/utils";

type DepartmentPickerProps = {
  hotelId: string;
  selectedDepartment?: Department;
  initialDepartmentId?: string;
  onSelect: (department: Department | undefined) => void;
};

export function DepartmentPicker({
  hotelId,
  selectedDepartment,
  initialDepartmentId,
  onSelect,
}: DepartmentPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: allDepartments = [], isLoading } = useGetDepartments(hotelId);

  const initialDepartment =
    !selectedDepartment && initialDepartmentId
      ? allDepartments.find((d) => d.id === initialDepartmentId)
      : undefined;

  const departments = allDepartments.filter((d) =>
    search ? d.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const displayDepartment = selectedDepartment ?? initialDepartment;

  function handleSelect(department: Department) {
    onSelect(displayDepartment?.id === department.id ? undefined : department);
    setOpen(false);
    setSearch("");
  }

  const triggerLabel = displayDepartment?.name ?? "No department";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-bg-selected",
          displayDepartment ? "text-text-default" : "text-text-subtle",
        )}
      >
        {triggerLabel}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-72 p-0"
      >
        <div className="border-b border-stroke-subtle p-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search departments..."
            autoFocus
          />
        </div>
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
                displayDepartment?.id === department.id && "bg-bg-selected",
              )}
            >
              <p className="truncate text-sm text-text-default">
                {department.name}
              </p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
