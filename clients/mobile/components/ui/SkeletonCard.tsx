import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

type SkeletonLineProps = {
  width: `${number}%` | number;
  opacity: Animated.Value;
};

function SkeletonLine({ width, opacity }: SkeletonLineProps) {
  return (
    <Animated.View
      className="bg-stroke-subtle rounded-full h-[10px]"
      style={[{ width }, { opacity }]}
    />
  );
}

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => opacity.stopAnimation();
  }, [opacity]);

  return (
    <View className="bg-stroke-disabled rounded-lg px-4 py-4 gap-3">
      <SkeletonLine width="100%" opacity={opacity} />
      <SkeletonLine width="66%" opacity={opacity} />
      <SkeletonLine width="84%" opacity={opacity} />
      <View className="flex-row justify-between">
        <SkeletonLine width="34%" opacity={opacity} />
        <SkeletonLine width="34%" opacity={opacity} />
      </View>
      <SkeletonLine width="100%" opacity={opacity} />
    </View>
  );
}
