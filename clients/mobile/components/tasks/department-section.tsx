import { View } from "react-native";

import { CheckboxItem, SectionHeader } from "./filter-section-header";

const DEPT_LEFT = ["Food & Beverage", "Front Office", "Housekeeping"];
const DEPT_RIGHT = ["Maintenance", "Management", "Security"];
const DEPT_CHECKED = new Set(["Food & Beverage", "Front Office"]);

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
