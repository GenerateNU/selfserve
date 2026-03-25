import LogoutButton from "@/components/Logout";
import { router } from "expo-router";
import { View } from "react-native";

export default function Profile() {
  const onSignOut = () => {
    router.replace("/sign-in");
  };

  return (
    <View className="flex-1 justify-center px-6">
      <LogoutButton onSignOut={onSignOut} />
    </View>
  );
}
