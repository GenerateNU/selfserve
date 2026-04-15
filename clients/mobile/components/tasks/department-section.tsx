import { View } from "react-native";

import { CheckboxRow, Section } from "./filter-section-header";

const DEPARTMENTS = [
  "Food & Beverage",
  "Front Office",
  "Housekeeping",
  "Maintenance",
  "Management",
  "Security",
];

const DEFAULT_CHECKED = new Set(["Food & Beverage", "Front Office"]);

export function DepartmentSection() {
  return (
    <Section title="Department">
      <View className="flex-row flex-wrap gap-x-[8vw]">
        {DEPARTMENTS.map((dept) => (
          <CheckboxRow
            key={dept}
            label={dept}
            selected={DEFAULT_CHECKED.has(dept)}
            onPress={() => {}}
          />
        ))}
      </View>
    </Section>
  );
}
