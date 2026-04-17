import { useUser } from "@clerk/clerk-react";
import { useGetUser } from "@shared";

export function useIsAdmin() {
  const { user: clerkUser } = useUser();
  const { data: currentUser, isLoading } = useGetUser(clerkUser?.id);
  return {
    isAdmin: currentUser?.role === "admin",
    isLoading,
  };
}
