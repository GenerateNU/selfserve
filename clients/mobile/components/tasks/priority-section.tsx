import { View } from "react-native";

import { CheckboxRow, Section } from "./filter-section-header";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

export function PrioritySection() {
  return (
    <Section title="Priority">
      <View className="flex-row gap-[4vw]">
        {PRIORITY_OPTIONS.map((p) => (
          <CheckboxRow key={p} label={p} selected={true} onPress={() => {}} />
        ))}
      </View>
    </Section>
  );
}
