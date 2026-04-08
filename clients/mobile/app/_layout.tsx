import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-native-reanimated";
import "../global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { tokenCache } from "@clerk/clerk-expo/token-cache";
import {
  ClerkProvider,
  useAuth,
} from "@clerk/clerk-expo";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { setConfig } from "@shared";
import { useEffect, useState } from "react";

// Client explicity created outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

// Component to configure auth provider and the api base url
function AppConfigurator({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    const init = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError(true);
          return;
        }
        const user = await res.json();
        if (!user.hotel_id) {
          setError(true);
          return;
        }

        setConfig({
          API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
          getToken,
          hotelId: user.hotel_id,
        });

        setReady(true);
      } catch (e) {
        setError(true);
      }
    };

    init();
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded || !isSignedIn) return <>{children}</>;
  if (error) return <Redirect href="/no-org" />;
  if (!ready) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
        <AppConfigurator>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
        </AppConfigurator>
    </ClerkProvider>
  );
}
