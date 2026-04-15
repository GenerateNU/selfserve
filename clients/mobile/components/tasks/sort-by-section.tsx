import { View } from "react-native";

import type { RequestFeedSort } from "@shared/api/requests";

import { RadioRow, Section } from "./filter-section-header";

type SortBySectionProps = {
  sort: RequestFeedSort;
  onSortChange: (sort: RequestFeedSort) => void;
};

const SORT_OPTIONS: { label: string; value: RequestFeedSort }[] = [
  { label: "Priority", value: "priority" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

export function SortBySection({ sort, onSortChange }: SortBySectionProps) {
  return (
    <Section title="Sort By">
      <View className="flex-row gap-[4vw]">
        {SORT_OPTIONS.map((option) => (
          <RadioRow
            key={option.value}
            label={option.label}
            selected={sort === option.value}
            onPress={() => onSortChange(option.value)}
          />
        ))}
      </View>
    </Section>
  );
}
