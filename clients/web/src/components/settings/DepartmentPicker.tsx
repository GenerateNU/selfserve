import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  useAddEmployeeDepartment,
  useGetDepartments,
  useRemoveEmployeeDepartment,
} from "@shared";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DepartmentPickerProps = {
  memberId: string;
  hotelId: string;
  departmentNames: Array<string>;
};

export function DepartmentPicker({
  memberId,
  hotelId,
  departmentNames,
}: DepartmentPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(departmentNames),
  );

  const { data } = useGetDepartments(hotelId);
  const departments = data ?? [];
  const { mutate: addDept } = useAddEmployeeDepartment(hotelId);
  const { mutate: removeDept } = useRemoveEmployeeDepartment(hotelId);

  const label = selected.size > 0 ? [...selected].join(", ") : "—";

  function toggle(deptId: string, deptName: string, checked: boolean) {
    if (checked) {
      setSelected((prev) => new Set([...prev, deptName]));
      addDept({ employeeId: memberId, departmentId: deptId });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deptName);
        return next;
      });
      removeDept({ employeeId: memberId, departmentId: deptId });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-bg-selected transition-colors outline-none">
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown className="size-3 shrink-0 text-text-subtle opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {departments.length === 0 ? (
          <p className="px-1.5 py-1 text-xs text-text-subtle">No departments</p>
        ) : (
          departments.map((dept) => (
            <DropdownMenuCheckboxItem
              key={dept.id}
              checked={selected.has(dept.name)}
              onCheckedChange={(checked) => toggle(dept.id, dept.name, checked)}
              onSelect={(e) => e.preventDefault()}
            >
              {dept.name}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
