import { useClerk } from "@clerk/clerk-expo";
import { Pressable, Text } from "react-native";

export default function LogoutButton({ onSignOut }: { onSignOut: () => void }) {
  const { signOut } = useClerk();

  const onPress = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <Pressable
      onPress={onPress}
      className="border border-danger rounded-xl py-4 items-center active:opacity-80"
    >
      <Text className="text-danger font-semibold text-base">Sign Out</Text>
    </Pressable>
  );
}
