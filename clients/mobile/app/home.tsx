import { Text, View, Pressable } from "react-native";
import { router } from "expo-router";

export default function Page() {
  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-4xl mx-auto">
        <Text className="text-6xl font-bold">Hello</Text>
        <Text className="text-4xl text-gray-700">World</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/explore")}
          className="bg-primary rounded-xl py-4 items-center mt-8 active:opacity-80"
        >
          <Text >Go to tabs</Text>
        </Pressable>
      </View>
    </View>
  );
}
