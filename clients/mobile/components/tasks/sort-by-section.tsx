import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";

import { RadioItem, SectionHeader } from "./filter-section-header";

type SortBySectionProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function SortBySection({ expanded, onToggle }: SortBySectionProps) {
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
          <RadioItem label="Priority" selected />
          <RadioItem label="Newest" selected={false} />
          <RadioItem label="Oldest" selected={false} />
        </View>
      )}
    </View>
  );
}
