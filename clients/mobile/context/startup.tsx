import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { setConfig } from "@shared";

export enum StartupStatus {
  Loading,
  Unauthenticated,
  NoUserInfo,
  Ready,
}

const StartupContext = createContext<StartupStatus>(StartupStatus.Loading);

export function useStartup() {
  return useContext(StartupContext);
}

export function StartupProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const { data, status } = useQuery({
    queryKey: ["startup-user", userId],
    queryFn: async () => {
      const token = await getToken();
      const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/users/${userId}`;
      console.log("url", url);
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("res", res);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!isLoaded && !!isSignedIn && !!userId,
    retry: 5,
    retryDelay: (attempt) => 1000 * 2 ** attempt,
  });

  if (data) {
    setConfig({
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
      getToken,
      hotelId: data.hotel_id,
    });
  }

  console.log("data", data);
  console.log("status", status);
  console.log("isLoaded", isLoaded);
  console.log("isSignedIn", isSignedIn);
  console.log("userId", userId);

  console.log("data", data);
  console.log("status", status);
  console.log("isLoaded", isLoaded);
  console.log("isSignedIn", isSignedIn);
  console.log("userId", userId);

  const startupStatus = useMemo<StartupStatus>(() => {
    if (!isLoaded) return StartupStatus.Loading;
    if (!isSignedIn) return StartupStatus.Unauthenticated;
    if (status === "pending") return StartupStatus.Loading;
    if (status === "error") return StartupStatus.NoUserInfo;
    return StartupStatus.Ready;
  }, [isLoaded, isSignedIn, status]);

  return (
    <StartupContext.Provider value={startupStatus}>
      {children}
    </StartupContext.Provider>
  );
}
