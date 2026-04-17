import { Pressable, View, Text } from "react-native";
import { cn } from "@/lib/utils";

type RoleCardProps = {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

export function RoleCard({ label, description, selected, onSelect }: RoleCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        "flex-row items-start p-4 rounded-2xl border mb-3",
        selected
          ? "border-primary bg-bg-selected"
          : "border-stroke-subtle bg-white"
      )}
    >
      <View
        className={cn(
          "w-5 h-5 rounded-full border-2 items-center justify-center mr-3 mt-0.5",
          selected ? "border-primary" : "border-stroke-subtle"
        )}
      >
        {selected && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            "text-base font-semibold mb-1",
            selected ? "text-primary" : "text-text-default"
          )}
        >
          {label}
        </Text>
        <Text className="text-sm text-text-subtle leading-5">
          {description}
        </Text>
      </View>
    </Pressable>
  );
}
