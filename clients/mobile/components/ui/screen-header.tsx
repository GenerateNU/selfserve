import Feather from "@expo/vector-icons/Feather";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <>
      <View className="flex-row items-center gap-2.5 px-[22px] pt-3 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="chevron-left" size={20} color="black" />
        </Pressable>
        <Text className="flex-1 text-2xl font-medium text-text-default tracking-tight">
          {title}
        </Text>
      </View>
      <View className="border-b border-stroke-disabled" />
    </>
  );
}
