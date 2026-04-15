import { View } from "react-native";

import { CheckboxRow, Section } from "./filter-section-header";

const PRIORITY_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
] as const;

type PrioritySectionProps = {
  priorities: string[];
  onPrioritiesChange: (priorities: string[]) => void;
};

export function PrioritySection({
  priorities,
  onPrioritiesChange,
}: PrioritySectionProps) {
  function toggle(value: string) {
    const next = priorities.includes(value)
      ? priorities.filter((p) => p !== value)
      : [...priorities, value];
    onPrioritiesChange(next);
  }

  return (
    <Section title="Priority">
      <View className="flex-row gap-[4vw]">
        {PRIORITY_OPTIONS.map((option) => (
          <CheckboxRow
            key={option.value}
            label={option.label}
            selected={priorities.includes(option.value)}
            onPress={() => toggle(option.value)}
          />
        ))}
      </View>
    </Section>
  );
}
