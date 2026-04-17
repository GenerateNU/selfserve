import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Send,
  ChevronLeft,
  NotepadText,
  Clock4,
  CalendarSync,
  Flag,
  MapPin,
  House,
  ChevronRight,
} from "lucide-react-native";
import { useAPIClient } from "@shared/api/client";
import { getConfig } from "@shared/api/config";
import type { GenerateRequestResponse, MakeRequest } from "@shared";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

// Token values for JSX props that can't use className (icon colors, placeholder, etc.)
const colors = {
  primary: "#15502c",
  textSubtle: "#747474",
  textSecondary: "#5d5d5d",
  strokeSubtle: "#d8d8d8",
  white: "#ffffff",
} as const;

type ScreenState = "idle" | "loading" | "complete";

type GeneratedTask = {
  name: string;
  request_type?: string;
  scheduled_time?: string;
  reoccurring?: string;
  priority?: string;
  room_id?: string;
  department?: string;
  description?: string;
  user_id?: string;
};

type TaskFieldRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
};

function TaskFieldRow({ icon, label, value }: TaskFieldRowProps) {
  return (
    <View className="flex-row items-center justify-between h-6">
      <View className="flex-row items-center gap-1">
        {icon}
        <Text className="text-[15px] text-text-subtle tracking-tight">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center">
        {value ? (
          <Text className="text-[15px] text-text-default tracking-tight">
            {value}
          </Text>
        ) : (
          <>
            <Text className="text-[15px] text-text-subtle tracking-tight">
              Select...
            </Text>
            <ChevronRight size={16} color={colors.textSubtle} />
          </>
        )}
      </View>
    </View>
  );
}

export default function CreateTaskAIScreen() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [generatedTask, setGeneratedTask] = useState<GeneratedTask | null>(
    null,
  );
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);

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
        priority: req?.priority,
        room_id: req?.room_id,
        department: req?.department,
        description: req?.description,
        user_id: req?.user_id,
      });
      setScreenState("complete");
      setTaskSheetVisible(true);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (task: MakeRequest) => api.post<unknown>("/request", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      router.navigate("/(tabs)/tasks");
    },
  });

  const handleSend = () => {
    if (!query.trim() || generateMutation.isPending) return;
    setSubmittedQuery(query);
    setQuery("");
    setScreenState("loading");
    generateMutation.mutate(query.trim());
  };

  const handleSaveTask = () => {
    if (!generatedTask) return;
    const { hotelId } = getConfig();
    saveMutation.mutate({
      hotel_id: hotelId,
      name: generatedTask.name,
      request_type: generatedTask.request_type,
      scheduled_time: generatedTask.scheduled_time,
      priority: generatedTask.priority as MakeRequest["priority"],
      room_id: generatedTask.room_id,
      department: generatedTask.department,
      description: generatedTask.description,
      user_id: generatedTask.user_id,
    });
  };

  const handleCancelSheet = () => {
    setTaskSheetVisible(false);
    setScreenState("idle");
    setGeneratedTask(null);
    setSubmittedQuery("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-[22px] py-3 border-b border-stroke-disabled h-14">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={20} color="black" />
        </Pressable>
        <Text className="text-2xl font-medium text-text-default tracking-tight">
          Task Creation
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Content area */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Submitted query bubble */}
          {submittedQuery ? (
            <View className="bg-bg-selected border border-primary-accent rounded-lg p-4">
              <Text className="text-[15px] text-primary-surface tracking-tight leading-[1.25]">
                {submittedQuery}
              </Text>
            </View>
          ) : null}

          {/* Loading state */}
          {screenState === "loading" && (
            <>
              <View className="flex-row items-center gap-3 py-2">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-[16px] text-primary tracking-tight">
                  Creating Task...
                </Text>
              </View>
              <SkeletonCard />
            </>
          )}
        </ScrollView>

        {/* AI Chat Input */}
        <View className="px-6 py-5 bg-white border-t border-stroke-disabled">
          <View className="flex-row items-center border border-stroke-subtle rounded-lg px-4 py-3 gap-3">
            <Sparkles size={20} color={colors.primary} />
            <View className="w-px h-5 bg-stroke-subtle" />
            <TextInput
              className="flex-1 text-[15px] text-text-secondary tracking-tight"
              placeholder="Start typing to create a new task..."
              placeholderTextColor={colors.textSecondary}
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
                    ? colors.primary
                    : colors.strokeSubtle
                }
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Task Review Sheet */}
      <Modal
        visible={taskSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancelSheet}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-tl-3xl rounded-tr-3xl pt-10 pb-12 px-6">
            {/* Drag handle */}
            <View className="absolute top-4 left-0 right-0 items-center">
              <View className="w-11 h-1 rounded-full bg-text-disabled" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-6">
                {/* Title */}
                <View className="border border-stroke-subtle rounded p-2">
                  <Text className="text-2xl font-medium text-text-default tracking-tight">
                    {generatedTask?.name}
                  </Text>
                </View>

                {/* Fields */}
                <View className="gap-4">
                  <TaskFieldRow
                    icon={<NotepadText size={16} color={colors.textSubtle} />}
                    label="Task Type"
                    value={generatedTask?.request_type}
                  />
                  <TaskFieldRow
                    icon={<Clock4 size={16} color={colors.textSubtle} />}
                    label="Deadline"
                    value={generatedTask?.scheduled_time}
                  />
                  <TaskFieldRow
                    icon={<CalendarSync size={16} color={colors.textSubtle} />}
                    label="Reoccurring"
                    value={generatedTask?.reoccurring}
                  />
                  <TaskFieldRow
                    icon={<Flag size={16} color={colors.textSubtle} />}
                    label="Priority"
                    value={generatedTask?.priority}
                  />
                  <TaskFieldRow
                    icon={<MapPin size={16} color={colors.textSubtle} />}
                    label="Location"
                    value={generatedTask?.room_id}
                  />
                  <TaskFieldRow
                    icon={<House size={16} color={colors.textSubtle} />}
                    label="Department"
                    value={generatedTask?.department}
                  />

                  {/* Description */}
                  <View className="gap-1">
                    <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                      Description
                    </Text>
                    <Text className="text-[15px] text-text-secondary tracking-tight leading-[1.25]">
                      {generatedTask?.description ?? "Empty"}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="gap-4 mt-2">
                  <Pressable
                    onPress={handleSaveTask}
                    disabled={saveMutation.isPending}
                    className="bg-primary rounded h-[39px] items-center justify-center"
                  >
                    {saveMutation.isPending ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text className="text-[15px] text-white tracking-tight">
                        Save Task
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={handleCancelSheet}
                    className="border border-primary rounded h-[39px] items-center justify-center"
                  >
                    <Text className="text-[15px] text-primary tracking-tight">
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
