import { Stack } from "expo-router";
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
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StartupProvider, useStartup } from "@/context/startup";
import NoUserInfo from "@/components/ui/NoUserInfo";
import { ActivityIndicator, View } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppLayout() {
  const colorScheme = useColorScheme();
  const status = useStartup();

  if (status === "no-user-info") return <NoUserInfo />;
  if (status === "loading") return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      
        <QueryClientProvider client={queryClient}>
          <StartupProvider>
          <SafeAreaProvider>
            <AppLayout />
          </SafeAreaProvider>
          </StartupProvider>
        </QueryClientProvider>
    </ClerkProvider>
  );
}
