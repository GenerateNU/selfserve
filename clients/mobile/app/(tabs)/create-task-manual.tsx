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
import {
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
import type { MakeRequest } from "@shared";

const colors = {
  primary: "#15502c",
  textSubtle: "#747474",
  strokeSubtle: "#d8d8d8",
  white: "#ffffff",
} as const;

type TaskFieldRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
};

function TaskFieldRow({ icon, label, value, onPress }: TaskFieldRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between h-6"
    >
      <View className="flex-row items-center gap-1">
        {icon}
        <Text className="text-[15px] text-text-subtle tracking-tight">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-[15px] tracking-tight ${value ? "text-text-default" : "text-text-subtle"}`}
        >
          {value ?? "Select..."}
        </Text>
        <ChevronRight size={14} color={colors.textSubtle} />
      </View>
    </Pressable>
  );
}

export default function CreateTaskManualScreen() {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");

  const api = useAPIClient();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (task: MakeRequest) => api.post<unknown>("/request", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      router.back();
    },
  });

  const handleSave = () => {
    if (!taskName.trim() || saveMutation.isPending) return;
    const { hotelId } = getConfig();
    saveMutation.mutate({
      hotel_id: hotelId,
      name: taskName.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-[22px] py-3 border-b border-stroke-disabled h-14">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={20} color="black" />
        </Pressable>
        <Text className="text-2xl font-medium text-text-default tracking-tight">
          Tasks
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
          {/* Task Name Input */}
          <View className="border border-stroke-subtle rounded p-2">
            <TextInput
              className="text-2xl font-bold text-text-default tracking-tight"
              placeholder="Task Name"
              placeholderTextColor={colors.textSubtle}
              value={taskName}
              onChangeText={setTaskName}
              returnKeyType="done"
            />
          </View>

          {/* Task Fields */}
          <View className="gap-4">
            <TaskFieldRow
              icon={<NotepadText size={16} color={colors.textSubtle} />}
              label="Task Type"
            />
            <TaskFieldRow
              icon={<Clock4 size={16} color={colors.textSubtle} />}
              label="Deadline"
            />
            <TaskFieldRow
              icon={<CalendarSync size={16} color={colors.textSubtle} />}
              label="Reoccurring"
            />
            <TaskFieldRow
              icon={<Flag size={16} color={colors.textSubtle} />}
              label="Priority"
            />
            <TaskFieldRow
              icon={<MapPin size={16} color={colors.textSubtle} />}
              label="Location"
            />
            <TaskFieldRow
              icon={<House size={16} color={colors.textSubtle} />}
              label="Department"
            />

            {/* Description */}
            <View className="gap-1">
              <Text className="text-[15px] font-medium text-text-subtle tracking-tight">
                Description
              </Text>
              <TextInput
                className="text-[15px] text-text-default tracking-tight leading-[1.25]"
                placeholder="Empty"
                placeholderTextColor={colors.textSubtle}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Actions */}
          <View className="gap-4">
            <Pressable
              onPress={handleSave}
              disabled={!taskName.trim() || saveMutation.isPending}
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
              onPress={() => router.back()}
              className="border border-primary rounded h-[39px] items-center justify-center"
            >
              <Text className="text-[15px] text-primary tracking-tight">
                Cancel
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
