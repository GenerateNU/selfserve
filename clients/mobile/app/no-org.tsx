import { View, Text } from "react-native";

export default function NoOrg() {
  return (
    <View className="flex-1 items-center justify-center px-[8vw] bg-white">
      <Text className="text-[5vw] font-semibold text-black text-center mb-[2vh]">
        No Organization Found
      </Text>
      <Text className="text-[3.5vw] text-center text-shadow-strong">
        You're not part of a hotel organization yet. Please contact your manager
        for an invitation.
      </Text>
    </View>
  );
}
