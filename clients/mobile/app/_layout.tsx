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
import { ClerkProvider } from "@clerk/clerk-expo";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StartupProvider, StartupStatus, useStartup } from "@/context/startup";
import NoUserInfo from "@/components/ui/NoUserInfo";
import { ActivityIndicator, StyleSheet, View } from "react-native";

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

  if (status === StartupStatus.NoUserInfo) return <NoUserInfo />;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="create-task-ai" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-task-manual"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      {status === StartupStatus.Loading && (
        <View
          style={StyleSheet.absoluteFill}
          className="justify-center items-center bg-bg-primary"
        >
          <ActivityIndicator size="large" />
        </View>
      )}
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
