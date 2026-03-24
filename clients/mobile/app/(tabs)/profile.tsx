import LogoutButton from "@/components/Logout";
import { router } from "expo-router";

export default function Profile() {
  const onSignOut = () => {
    router.replace("/sign-in");
  };

  return <LogoutButton onSignOut={onSignOut} />;
}
