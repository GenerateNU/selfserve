import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { setConfig } from "@shared";

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
function AppConfigurator() {
  const { getToken } = useAuth();
  useEffect(() => {
    setConfig({
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
      getToken,
      ROOMS_HOTEL_ID:
        process.env.EXPO_PUBLIC_ROOMS_HOTEL_ID ||
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
  }, [getToken]);
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <ClerkLoaded>
          <AppConfigurator />
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <SafeAreaProvider>
                <ThemeProvider
                  value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="modal"
                      options={{ presentation: "modal", title: "Modal" }}
                    />
                  </Stack>
                  <StatusBar style="auto" />
                </ThemeProvider>
              </SafeAreaProvider>
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
