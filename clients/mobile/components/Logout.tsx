import { useClerk } from "@clerk/clerk-expo";
import { Pressable, Text } from "react-native";

export default function LogoutButton({ onSignOut }: { onSignOut: () => void }) {
  const { signOut } = useClerk();

  const onPress = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <Pressable onPress={onPress}>
      <Text>Sign Out</Text>
    </Pressable>
  );
}
