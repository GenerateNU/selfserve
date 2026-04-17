import { StartupStatus, useStartup } from "@/context/startup";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const status = useStartup();
  const router = useRouter();

  useEffect(() => {
    console.log("status", status);
    if (status === StartupStatus.Loading) return;
    if (status === StartupStatus.Unauthenticated) {
      router.replace("/sign-in");
      return;
    }

    router.replace("/(tabs)");
  }, [status, router]);

  return null;
}
