import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, View } from "react-native";

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  className,
  weight = "regular",
}: {
  name: SymbolViewProps["name"];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  weight?: SymbolWeight;
}) {
  const symbolView = (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );

  // If className is provided, wrap in a View to apply NativeWind classes
  if (className) {
    return <View className={className}>{symbolView}</View>;
  }

  return symbolView;
}
