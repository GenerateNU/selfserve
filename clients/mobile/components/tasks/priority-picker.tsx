import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Flag, ChevronRight, X } from "lucide-react-native";
import type { MakeRequestPriority } from "@shared";

type PriorityConfig = {
  bgClass: string;
  textClass: string;
  selectedClass: string;
  flagColor: string;
  label: string;
};

const PRIORITY_CONFIG: Record<MakeRequestPriority, PriorityConfig> = {
  high: {
    bgClass: "bg-priority-high-bg",
    textClass: "text-priority-high",
    selectedClass: "border border-priority-high",
    flagColor: "#a21313",
    label: "High",
  },
  medium: {
    bgClass: "bg-priority-medium-bg",
    textClass: "text-priority-medium",
    selectedClass: "border border-priority-medium",
    flagColor: "#ff8c3f",
    label: "Medium",
  },
  low: {
    bgClass: "bg-priority-low-bg",
    textClass: "text-priority-low",
    selectedClass: "border border-priority-low",
    flagColor: "#2f61ce",
    label: "Low",
  },
};

const PRIORITIES: MakeRequestPriority[] = ["high", "medium", "low"];

type PriorityPickerProps = {
  value: MakeRequestPriority | undefined;
  onChange: (value: MakeRequestPriority | undefined) => void;
};

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="gap-2">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between h-6"
      >
        <View className="flex-row items-center gap-1">
          <Flag size={16} color="#747474" />
          <Text className="text-[15px] text-text-subtle tracking-tight">
            Priority
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-[15px] text-text-subtle tracking-tight">
            {value ? PRIORITY_CONFIG[value].label : "Select..."}
          </Text>
          <ChevronRight
            size={14}
            color="#747474"
            style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
          />
        </View>
      </Pressable>

      {expanded && (
        <View className="flex-row gap-2">
          {PRIORITIES.map((p) => {
            const config = PRIORITY_CONFIG[p];
            const isSelected = value === p;
            return (
              <Pressable
                key={p}
                onPress={() => onChange(p)}
                className={`flex-row items-center gap-1 rounded px-2 py-1 ${config.bgClass} ${isSelected ? config.selectedClass : ""}`}
              >
                <Flag size={14} color={config.flagColor} />
                <Text className={`text-xs tracking-tight ${config.textClass}`}>
                  {config.label}
                </Text>
                {isSelected && (
                  <Pressable onPress={() => onChange(undefined)} hitSlop={4}>
                    <X size={12} color={config.flagColor} />
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
