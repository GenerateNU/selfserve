import { Image } from "expo-image";
import { TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGetHelloName } from "@/hooks/use-hello";

export default function HomeScreen() {
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const { data, isLoading, error, refetch } = useGetHelloName(submittedName);

  const handleSubmit = () => {
    if (name.trim()) {
      setSubmittedName(name);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/dao.webp")}
          contentFit="cover"
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      }
    >
      <ThemedView className="flex-row items-center gap-2">
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* API Test Section */}
      <ThemedView className="gap-2 mb-4 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
        <ThemedText type="subtitle">API Test</ThemedText>
        <ThemedText className="text-sm">
          Test the shared API client with GET /api/v1/hello/:name
        </ThemedText>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 mb-2 text-black dark:text-white bg-white dark:bg-gray-800"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={!name.trim() || isLoading}
          className={`rounded-lg px-4 py-3 items-center ${
            !name.trim() || isLoading
              ? "bg-gray-400 dark:bg-gray-600"
              : "bg-blue-500"
          }`}
        >
          <ThemedText className="text-white font-semibold">
            {isLoading ? "Loading..." : "Call API"}
          </ThemedText>
        </Pressable>

        {/* Response Section */}
        <ThemedView className="mt-4">
          {isLoading && (
            <ThemedView className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#0ea5e9" />
              <ThemedText>Fetching data...</ThemedText>
            </ThemedView>
          )}

          {error && (
            <ThemedView className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <ThemedText className="text-red-600 dark:text-red-400 font-semibold">
                Error: {error.message}
              </ThemedText>
            </ThemedView>
          )}

          {data && !isLoading && (
            <ThemedView className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <ThemedText className="text-green-700 dark:text-green-400 font-semibold mb-2">
                Success! 🎉
              </ThemedText>
              <ThemedText className="text-lg font-mono">{data}</ThemedText>
              <Pressable onPress={() => refetch()} className="mt-2">
                <ThemedText className="text-blue-500 underline">
                  Refetch
                </ThemedText>
              </Pressable>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}
