import Feather from "@expo/vector-icons/Feather";
import { Text, View } from "react-native";
import type { RequestPriority } from "@shared";

type PriorityConfig = {
  containerClass: string;
  textClass: string;
  label: string;
  iconColor: string;
};

const PRIORITY_CONFIG: Record<RequestPriority, PriorityConfig> = {
  high: {
    containerClass: "bg-priority-high-bg",
    textClass: "text-priority-high",
    label: "High Priority",
    iconColor: "#a21313",
  },
  medium: {
    containerClass: "bg-priority-medium-bg",
    textClass: "text-priority-medium",
    label: "Medium Priority",
    iconColor: "#ff8c3f",
  },
  low: {
    containerClass: "bg-priority-low-bg",
    textClass: "text-priority-low",
    label: "Low Priority",
    iconColor: "#2f61ce",
  },
};

type PriorityTagProps = {
  priority: string;
  dimmed?: boolean;
};

export function PriorityTag({ priority, dimmed = false }: PriorityTagProps) {
  const config =
    PRIORITY_CONFIG[priority.toLowerCase() as RequestPriority] ??
    PRIORITY_CONFIG.low;

  return (
    <View
      className={`${config.containerClass} flex-row items-center gap-1 px-2 py-1 rounded`}
    >
      <Feather
        name="flag"
        size={12}
        color={dimmed ? "#bababa" : config.iconColor}
      />
      <Text
        className={`${dimmed ? "text-text-disabled" : config.textClass} text-xs`}
        numberOfLines={1}
      >
        {config.label}
      </Text>
    </View>
  );
}
