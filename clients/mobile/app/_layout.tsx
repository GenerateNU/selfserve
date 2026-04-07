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
  const { getToken, isLoaded, isSignedIn, orgId } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn && orgId) {
    setConfig({
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
      getToken,
      hotelId: orgId,
    });
    return <>{children}</>;
  }
  
  if (isSignedIn && !orgId) return null;

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
