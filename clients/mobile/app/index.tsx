import { StyleSheet, Text, View } from "react-native";

export default function Page() {
  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-4xl mx-auto">
        <Text className="text-6xl font-bold">Hello</Text>
        <Text className="text-4xl text-gray-700">World</Text>
      </View>
    </View>
  );
}