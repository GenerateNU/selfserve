import { StartupStatus, useStartup } from "@/context/startup";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const status = useStartup();
  const router = useRouter();

  useEffect(() => {
    if (status === StartupStatus.Loading) return;
    if (status === StartupStatus.Unauthenticated) {
      router.replace("/sign-in");
      return;
    }

    if (status === StartupStatus.Onboarding) {
      router.replace("/onboarding");
      return;
    }

    router.replace("/(tabs)");
  }, [status, router]);

  return null;
}
