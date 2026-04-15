import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import { Colors } from "@/constants/theme";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="border-b border-stroke-subtle">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between px-[5vw] py-[2vh]"
      >
        <Text className="text-sm font-medium text-text-default">{title}</Text>
        {expanded ? (
          <ChevronUp size={16} color={Colors.light.textDefault} />
        ) : (
          <ChevronDown size={16} color={Colors.light.textDefault} />
        )}
      </Pressable>
      {expanded && <View className="px-[5vw] pb-[2vh]">{children}</View>}
    </View>
  );
}

export function CheckboxRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-[1vh]"
    >
      <View
        className={`w-5 h-5 rounded border items-center justify-center ${
          selected
            ? "bg-primary border-primary"
            : "bg-white border-stroke-subtle"
        }`}
      >
        {selected && <Check size={12} color={Colors.light.white} />}
      </View>
      <Text
        className={`text-sm ${selected ? "text-primary font-medium" : "text-text-default"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-[1vh]"
    >
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          selected ? "border-primary" : "border-stroke-subtle"
        }`}
      >
        {selected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </View>
      <Text
        className={`text-sm ${selected ? "text-primary font-medium" : "text-text-default"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
