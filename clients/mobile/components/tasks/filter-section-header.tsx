import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";

// ─── Primitives ────────────────────────────────────────────────────────────────

function CheckedBox() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        backgroundColor: "#124425",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name="check" size={9} color="white" />
    </View>
  );
}

function UncheckedBox() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderWidth: 0.8,
        borderColor: "#2e2e2e",
        borderRadius: 4,
        opacity: 0.5,
      }}
    />
  );
}

function RadioSelected() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 0.8,
        borderColor: "#124425",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#124425",
        }}
      />
    </View>
  );
}

function RadioUnselected() {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 0.8,
        borderColor: "#2e2e2e",
        opacity: 0.4,
      }}
    />
  );
}

// ─── Row items ─────────────────────────────────────────────────────────────────

export function RadioItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable className="flex-row items-center gap-1" onPress={onPress}>
      {selected ? <RadioSelected /> : <RadioUnselected />}
      <Text
        className="text-[15px] tracking-tight"
        style={{ color: selected ? "#15502c" : "#040506" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function CheckboxItem({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1">
      {checked ? <CheckedBox /> : <UncheckedBox />}
      <Text
        className="text-[15px] tracking-tight"
        style={{ color: checked ? "#15502c" : "#040506" }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────────

export type SectionHeaderProps = {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  customIcon?: React.ReactNode;
};

export function SectionHeader({
  label,
  expanded,
  onToggle,
  icon,
  customIcon,
}: SectionHeaderProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between"
    >
      <View className="flex-row items-center gap-1.5">
        {customIcon ??
          (icon ? <Feather name={icon} size={14} color="#464646" /> : null)}
        <Text className="text-[15px] text-[#464646] tracking-tight">
          {label}
        </Text>
      </View>
      <View className="w-6 h-6 items-center justify-center">
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color="#464646"
        />
      </View>
    </Pressable>
  );
}
