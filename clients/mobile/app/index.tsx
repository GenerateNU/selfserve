import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { isLoaded, isSignedIn, orgId } = useAuth();
  const { user } = useUser();
  const { setActive } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

     if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

     if (!orgId) {
      user.getOrganizationMemberships().then(({ data }) => {
        const first = data?.[0];
        if (first) {
          setActive({ organization: first.organization.id });
        } else {
          router.replace("/no-org");
        }
      });
      return;
    }
    
    router.replace("/(tabs)");

  }, [isLoaded, isSignedIn, orgId, user, setActive]);

  return null;
}
