import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Notifications" }} />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold text-gray-700">Notifications</Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            WIll be implemented soon.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

