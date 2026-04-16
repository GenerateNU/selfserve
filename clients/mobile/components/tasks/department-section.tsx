import { ActivityIndicator } from "react-native";

import { getConfig } from "@shared/api/config";
import { useGetDepartments } from "@shared/api/departments";

import { CheckboxRow, Section } from "./filter-section-header";

type DepartmentSectionProps = {
  departments: string[];
  onDepartmentsChange: (departments: string[]) => void;
};

export function DepartmentSection({
  departments,
  onDepartmentsChange,
}: DepartmentSectionProps) {
  const { hotelId } = getConfig();
  const { data: allDepartments = [], isLoading } = useGetDepartments(hotelId);

  function toggle(id: string) {
    const next = departments.includes(id)
      ? departments.filter((d) => d !== id)
      : [...departments, id];
    onDepartmentsChange(next);
  }

  return (
    <Section title="Department">
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        allDepartments.map((dept) => (
          <CheckboxRow
            key={dept.id}
            label={dept.name}
            selected={departments.includes(dept.id)}
            onPress={() => toggle(dept.id)}
          />
        ))
      )}
    </Section>
  );
}
