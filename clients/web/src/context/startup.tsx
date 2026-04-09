import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { setConfig } from "@shared";

type StartupStatus = "loading" | "unauthenticated" | "no-user-info" | "ready";

const StartupContext = createContext<StartupStatus>("loading");

export function useStartup() {
  return useContext(StartupContext);
}

export function StartupProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const { data, status } = useQuery({
    queryKey: ["startup-user", userId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!isLoaded && !!isSignedIn && !!userId,
    retry: 5,
    retryDelay: (attempt) => 1000 * 2 ** attempt,
  });

  if (data) {
    setConfig({
      API_BASE_URL: process.env.API_BASE_URL ?? "",
      getToken,
      hotelId: data.hotel_id,
    });
  }

  const startupStatus = useMemo<StartupStatus>(() => {
    if (!isLoaded) return "loading";
    if (!isSignedIn) return "unauthenticated";
    if (status === "pending") return "loading";
    if (status === "error") return "no-user-info";
    if (status === "success") return "ready";
    return "loading";
  }, [isLoaded, isSignedIn, status]);

  return (
    <StartupContext.Provider value={startupStatus}>
      {children}
    </StartupContext.Provider>
  );
}