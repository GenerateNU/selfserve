import { View, Text } from "react-native";

export default function NoUserInfo() {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-lg font-semibold mb-2">
        We could not fetch your information. Please contact your administrator.
      </Text>
    </View>
  );
}
