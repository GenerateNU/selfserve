import { Text, View } from "react-native";

interface TaskBadgeProps {
  label: string;
  variant?: "default" | "outlined";
}

export function TaskBadge({ label, variant = "default" }: TaskBadgeProps) {
  const isOutlined = variant === "outlined";
  return (
    <View
      className={
        isOutlined
          ? "border border-blue-600 rounded px-2 py-1"
          : "bg-gray-200 rounded px-2 py-1"
      }
    >
      <Text
        className={
          isOutlined
            ? "text-xs font-medium text-blue-600"
            : "text-xs font-medium text-gray-700"
        }
      >
        {label}
      </Text>
    </View>
  );
}
