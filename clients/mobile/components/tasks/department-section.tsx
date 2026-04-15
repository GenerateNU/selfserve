import { View } from "react-native";

import { CheckboxItem, SectionHeader } from "./filter-section-header";

enum Department {
  FoodAndBeverage = "Food & Beverage",
  FrontOffice = "Front Office",
  Housekeeping = "Housekeeping",
  Maintenance = "Maintenance",
  Management = "Management",
  Security = "Security",
}

const DEPT_LEFT = [
  Department.FoodAndBeverage,
  Department.FrontOffice,
  Department.Housekeeping,
];
const DEPT_RIGHT = [
  Department.Maintenance,
  Department.Management,
  Department.Security,
];
const DEPT_CHECKED = new Set([Department.FoodAndBeverage, Department.FrontOffice]);

type DepartmentSectionProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function DepartmentSection({
  expanded,
  onToggle,
}: DepartmentSectionProps) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Department"
        expanded={expanded}
        onToggle={onToggle}
        icon="home"
      />
      {expanded && (
        <View className="flex-row justify-between px-1">
          <View className="gap-1">
            {DEPT_LEFT.map((d) => (
              <CheckboxItem key={d} label={d} checked={DEPT_CHECKED.has(d)} />
            ))}
          </View>
          <View className="gap-1">
            {DEPT_RIGHT.map((d) => (
              <CheckboxItem key={d} label={d} checked={DEPT_CHECKED.has(d)} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
