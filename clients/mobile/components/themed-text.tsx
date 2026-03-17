import { Text, type TextProps } from "react-native";
import { twMerge } from "tailwind-merge";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  className = "",
  ...rest
}: ThemedTextProps) {
  const typeClasses = {
    default: "text-base leading-6",
    defaultSemiBold: "text-base leading-6 font-semibold",
    title: "text-[32px] leading-8 font-bold",
    subtitle: "text-xl font-bold",
    link: "text-base leading-[30px] text-[#0a7ea4]",
  };

  const colorClass =
    lightColor || darkColor ? "" : "text-gray-900 dark:text-gray-100";

  const combinedClassName = twMerge(typeClasses[type], colorClass, className);

  return (
    <Text
      className={combinedClassName}
      style={[
        lightColor || darkColor ? { color: lightColor || darkColor } : {},
        style,
      ]}
      {...rest}
    />
  );
}
