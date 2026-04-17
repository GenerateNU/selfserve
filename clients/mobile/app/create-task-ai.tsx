import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Send, ChevronLeft } from "lucide-react-native";
import { useAPIClient } from "@shared/api/client";
import { getConfig } from "@shared/api/config";
import { REQUESTS_FEED_QUERY_KEY } from "@shared/api/requests";
import type { GenerateRequestResponse, MakeRequest } from "@shared";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import {
  AITaskEditSheet,
  type GeneratedTask,
} from "@/components/tasks/ai-task-edit-sheet";
import { Colors } from "@/constants/theme";

type ScreenState = "idle" | "loading";

export default function CreateTaskAIScreen() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [generatedTask, setGeneratedTask] = useState<GeneratedTask | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const api = useAPIClient();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (rawText: string) => {
      const { hotelId } = getConfig();
      return api.post<GenerateRequestResponse>("/request/generate", {
        hotel_id: hotelId,
        raw_text: rawText,
      });
    },
    onSuccess: (data) => {
      const req = data.request;

      setGeneratedTask({
        name: req?.name ?? "Untitled Task",
        request_type: req?.request_type,
        scheduled_time: req?.scheduled_time,
        reoccurring: undefined,
        priority: req?.priority,
        room_id: req?.room_id,
        department: req?.department,
        description: req?.description,
        user_id: req?.user_id,
      });

      setScreenState("idle");
      setIsEditSheetOpen(true);
    },
    onError: () => {
      setScreenState("idle");
    },
  });

  const saveMutation = useMutation({
    mutationFn: (task: MakeRequest) => api.post<unknown>("/request", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_FEED_QUERY_KEY });
      router.back();
    },
  });

  const handleSend = () => {
    if (!query.trim() || generateMutation.isPending) return;

    setSubmittedQuery(query.trim());
    setQuery("");
    setScreenState("loading");
    generateMutation.mutate(query.trim());
  };

  const handleCloseDraft = () => {
    setIsEditSheetOpen(false);
    setGeneratedTask(null);
    setScreenState("idle");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="h-14 flex-row items-center border-b border-stroke-disabled px-[22px] py-3">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={20} color="black" />
        </Pressable>
        <Text className="text-2xl font-medium tracking-tight text-text-default">
          Task Creation
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {submittedQuery ? (
            <View className="rounded-lg border border-primary-accent bg-bg-selected p-4">
              <Text className="text-[15px] leading-[1.25] tracking-tight text-primary-surface">
                {submittedQuery}
              </Text>
            </View>
          ) : null}

          {screenState === "loading" && (
            <>
              <View className="flex-row items-center gap-3 py-2">
                <ActivityIndicator
                  size="small"
                  color={Colors.light.tabBarActive}
                />
                <Text className="text-[16px] tracking-tight text-primary">
                  Creating Task...
                </Text>
              </View>
              <SkeletonCard />
            </>
          )}

          {generateMutation.isError && (
            <Text className="text-sm tracking-tight text-danger">
              Something went wrong generating the task. Please try again.
            </Text>
          )}
        </ScrollView>

        <View className="border-t border-stroke-disabled bg-white px-6 py-5">
          <View className="flex-row items-center gap-3 rounded-lg border border-stroke-subtle px-4 py-3">
            <Sparkles size={20} color={Colors.light.tabBarActive} />
            <View className="h-5 w-px bg-stroke-subtle" />
            <TextInput
              className="flex-1 text-[15px] tracking-tight text-text-secondary"
              placeholder="Start typing to create a new task..."
              placeholderTextColor={Colors.light.textSubtle}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline={false}
            />
            <Pressable
              onPress={handleSend}
              disabled={!query.trim() || generateMutation.isPending}
              className="p-1"
            >
              <Send
                size={16}
                color={
                  query.trim() && !generateMutation.isPending
                    ? Colors.light.tabBarActive
                    : Colors.light.borderLight
                }
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AITaskEditSheet
        visible={isEditSheetOpen}
        task={generatedTask}
        onClose={handleCloseDraft}
        onSave={(task) => saveMutation.mutate(task)}
        savePending={saveMutation.isPending}
      />
    </SafeAreaView>
  );
}