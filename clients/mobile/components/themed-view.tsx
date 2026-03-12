import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  className = "",
  ...otherProps
}: ThemedViewProps) {
  const bgColorClass = lightColor || darkColor ? "" : "bg-white dark:bg-black";

  const combinedClassName = `${bgColorClass} ${className}`.trim();

  return (
    <View
      className={combinedClassName}
      style={[
        lightColor || darkColor
          ? { backgroundColor: lightColor || darkColor }
          : {},
        style,
      ]}
      {...otherProps}
    />
  );
}
