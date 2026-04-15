import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";

import type { RequestFeedSort } from "@shared/api/requests";

import { RadioItem, SectionHeader } from "./filter-section-header";

type SortBySectionProps = {
  expanded: boolean;
  onToggle: () => void;
  sort: RequestFeedSort;
  onSortChange: (sort: RequestFeedSort) => void;
};

const SORT_OPTIONS: { label: string; value: RequestFeedSort }[] = [
  { label: "Priority", value: "priority" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

export function SortBySection({
  expanded,
  onToggle,
  sort,
  onSortChange,
}: SortBySectionProps) {
  return (
    <View className="gap-2">
      <SectionHeader
        label="Sort By"
        expanded={expanded}
        onToggle={onToggle}
        customIcon={
          <View style={{ width: 18, height: 16, alignItems: "center" }}>
            <Feather name="arrow-up" size={9} color="#464646" />
            <Feather name="arrow-down" size={9} color="#464646" />
          </View>
        }
      />
      {expanded && (
        <View className="flex-row justify-between px-1">
          {SORT_OPTIONS.map((option) => (
            <RadioItem
              key={option.value}
              label={option.label}
              selected={sort === option.value}
              onPress={() => onSortChange(option.value)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
