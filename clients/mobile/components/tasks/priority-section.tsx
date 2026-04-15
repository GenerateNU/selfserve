import { View } from "react-native";

import { CheckboxItem, SectionHeader } from "./filter-section-header";

type PrioritySectionProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function PrioritySection({ expanded, onToggle }: PrioritySectionProps) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Priority"
        expanded={expanded}
        onToggle={onToggle}
        icon="flag"
      />
      {expanded && (
        <View className="flex-row justify-between px-1">
          <CheckboxItem label="High" checked />
          <CheckboxItem label="Medium" checked />
          <CheckboxItem label="Low" checked />
        </View>
      )}
    </View>
  );
}
