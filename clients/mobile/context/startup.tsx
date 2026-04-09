import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { setConfig } from "@shared";

type StartupStatus = "loading" | "unauthenticated" | "no-user-info" | "ready";

const StartupContext = createContext<StartupStatus>("loading");

export function useStartup() {
  return useContext(StartupContext);
}

export function StartupProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const [status, setStatus] = useState<StartupStatus>("loading");
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const MAX_RETRIES = 5;
    const INITIAL_DELAY = 1000;

    const init = async () => {
      if (!isSignedIn || !userId) {
        setStatus("unauthenticated");
        return;
      }

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const token = await getToken();
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const user = await res.json();
          setConfig({
            API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
            getToken,
            hotelId: user.hotel_id,
          });
          setStatus("ready");
          return;
        }

        if (res.status === 404 && attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, INITIAL_DELAY * 2 ** attempt));
          continue;
        }

        setStatus("no-user-info");
        return;
      }
    };

    init();
  }, [isLoaded]);

  return (
    <StartupContext.Provider value={status}>{children}</StartupContext.Provider>
  );
}
