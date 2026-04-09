import { useStartup } from "@/context/startup";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const status = useStartup();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/sign-in");
      return;
    }

    router.replace("/(tabs)");
  }, [status]);

  return null;
}
